import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize neon connection
// This reads from process.env.DATABASE_URL by default
const sql = neon(process.env.DATABASE_URL);

// Dynamic GET route for all tables
app.get('/api/:table', async (req, res) => {
  const allowedTables = [
    'stock_records',
    'management_records',
    'feeding_records',
    'sales_records',
    'production_output_records',
    'production_inout_records',
    'staff_records',
    'individual_animals',
    'breeding_records',
    'health_records',
    'feed_inventory',
    'weight_records',
    'expense_records'
  ];
  
  const { table } = req.params;
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  try {
    const data = await sql.query(`SELECT * FROM ${table} ORDER BY id DESC`);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Dynamic POST route for all tables
app.post('/api/:table', async (req, res) => {
  const allowedTables = [
    'stock_records',
    'management_records',
    'feeding_records',
    'sales_records',
    'production_output_records',
    'production_inout_records',
    'staff_records',
    'individual_animals',
    'breeding_records',
    'health_records',
    'feed_inventory',
    'weight_records',
    'expense_records'
  ];
  
  const { table } = req.params;
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  try {
    const data = { ...req.body };
    
    // Automatically calculate expected farrowing date (service_date + 114 days)
    if (table === 'breeding_records' && data.service_date && !data.expected_farrowing_date) {
      const sDate = new Date(data.service_date);
      sDate.setDate(sDate.getDate() + 114);
      data.expected_farrowing_date = sDate.toISOString().split('T')[0];
    }

    // Automatically calculate health treatment withdrawal end date
    if (table === 'health_records' && data.date && data.withdrawal_days && !data.withdrawal_end_date) {
      const wDate = new Date(data.date);
      wDate.setDate(wDate.getDate() + parseInt(data.withdrawal_days, 10));
      data.withdrawal_end_date = wDate.toISOString().split('T')[0];
    }

    const keys = Object.keys(data);
    const values = Object.values(data);
    
    // We construct the query dynamically but safely since we control keys from req.body 
    // Usually it's better to explicitly define columns but this serves the generic RecordPage
    const columns = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await sql.query(`INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`, values);
    
    res.json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Analytics: Feed Conversion Ratio (FCR) ────────────────────────────────────
// GET /api/analytics/fcr?batch=BATCH_ID
// FCR = Total Feed Consumed (kg) / Total Weight Gained (kg)
app.get('/api/analytics/fcr', async (req, res) => {
  const { batch } = req.query;
  if (!batch) {
    return res.status(400).json({ error: 'batch query parameter is required' });
  }
  try {
    // Sum feed consumed for this batch from feeding_records
    const feedResult = await sql.query(
      `SELECT COALESCE(SUM(CAST(quantity AS NUMERIC)), 0) AS total_feed_kg FROM feeding_records WHERE batch = $1`,
      [batch]
    );
    // Weight gained = max weight - min weight in weight_records for this batch
    const weightResult = await sql.query(
      `SELECT COALESCE(MAX(weight_kg), 0) AS max_weight, COALESCE(MIN(weight_kg), 0) AS min_weight FROM weight_records WHERE batch = $1`,
      [batch]
    );

    const totalFeedKg = parseFloat(feedResult[0].total_feed_kg);
    const weightGained = parseFloat(weightResult[0].max_weight) - parseFloat(weightResult[0].min_weight);
    const fcr = weightGained > 0 ? (totalFeedKg / weightGained).toFixed(2) : null;

    res.json({
      batch,
      total_feed_kg: totalFeedKg,
      weight_gained_kg: weightGained.toFixed(2),
      fcr: fcr !== null ? parseFloat(fcr) : 'Insufficient weight data',
      fcr_interpretation: fcr ? (fcr < 2.5 ? 'Excellent' : fcr < 3.5 ? 'Good' : 'Poor') : 'N/A'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Analytics: Average Daily Gain (ADG) ───────────────────────────────────────
// GET /api/analytics/adg?batch=BATCH_ID
// OR  /api/analytics/adg?animal_tag=TAG
app.get('/api/analytics/adg', async (req, res) => {
  const { batch, animal_tag } = req.query;
  if (!batch && !animal_tag) {
    return res.status(400).json({ error: 'Either batch or animal_tag query parameter is required' });
  }

  try {
    let queryResult;
    if (batch) {
      queryResult = await sql.query(
        `SELECT 
           MIN(date) as min_date,
           MAX(date) as max_date,
           (SELECT weight_kg FROM weight_records WHERE batch = $1 ORDER BY date ASC, id ASC LIMIT 1) as start_weight,
           (SELECT weight_kg FROM weight_records WHERE batch = $1 ORDER BY date DESC, id DESC LIMIT 1) as end_weight
         FROM weight_records 
         WHERE batch = $1`,
        [batch]
      );
    } else {
      queryResult = await sql.query(
        `SELECT 
           MIN(date) as min_date,
           MAX(date) as max_date,
           (SELECT weight_kg FROM weight_records WHERE animal_tag = $1 ORDER BY date ASC, id ASC LIMIT 1) as start_weight,
           (SELECT weight_kg FROM weight_records WHERE animal_tag = $1 ORDER BY date DESC, id DESC LIMIT 1) as end_weight
         FROM weight_records 
         WHERE animal_tag = $1`,
        [animal_tag]
      );
    }

    if (!queryResult || queryResult.length === 0 || !queryResult[0].min_date || !queryResult[0].max_date) {
      return res.json({
        batch: batch || null,
        animal_tag: animal_tag || null,
        start_weight_kg: 0,
        end_weight_kg: 0,
        weight_gained_kg: 0,
        days_elapsed: 0,
        adg: 'Insufficient weight data',
        adg_interpretation: 'N/A',
        history: []
      });
    }

    const row = queryResult[0];
    const minDateStr = row.min_date.toString();
    const maxDateStr = row.max_date.toString();
    const startWeight = parseFloat(row.start_weight || 0);
    const endWeight = parseFloat(row.end_weight || 0);
    
    // Calculate difference in days
    const d1 = new Date(minDateStr);
    const d2 = new Date(maxDateStr);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weightGained = endWeight - startWeight;

    let adg = null;
    let adgInterpretation = 'N/A';

    if (diffDays > 0) {
      adg = parseFloat((weightGained / diffDays).toFixed(3));
      adgInterpretation = adg >= 0.7 ? 'Excellent' : adg >= 0.5 ? 'Good' : 'Poor';
    } else {
      adg = 'Insufficient timeframe (same day logs)';
    }

    // Retrieve full weight history for graphing
    let history;
    if (batch) {
      history = await sql.query(
        `SELECT date, weight_kg, weighing_stage FROM weight_records WHERE batch = $1 ORDER BY date ASC, id ASC`,
        [batch]
      );
    } else {
      history = await sql.query(
        `SELECT date, weight_kg, weighing_stage FROM weight_records WHERE animal_tag = $1 ORDER BY date ASC, id ASC`,
        [animal_tag]
      );
    }

    res.json({
      batch: batch || null,
      animal_tag: animal_tag || null,
      start_date: minDateStr,
      end_date: maxDateStr,
      start_weight_kg: startWeight,
      end_weight_kg: endWeight,
      weight_gained_kg: parseFloat(weightGained.toFixed(2)),
      days_elapsed: diffDays,
      adg,
      adg_interpretation: adgInterpretation,
      history
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// ── Analytics: Financial & Profitability ──────────────────────────────────────
// GET /api/analytics/profitability?batch=BATCH_ID
app.get('/api/analytics/profitability', async (req, res) => {
  const { batch } = req.query;
  if (!batch) {
    return res.status(400).json({ error: 'batch query parameter is required' });
  }

  try {
    // 1. Sum feed cost from feeding_records
    const feedCostResult = await sql.query(
      `SELECT COALESCE(SUM(CAST(cost AS NUMERIC)), 0) AS total_feed_cost FROM feeding_records WHERE batch = $1`,
      [batch]
    );
    const feedCost = parseFloat(feedCostResult[0].total_feed_cost);

    // 2. Sum other costs from expense_records
    const otherCostResult = await sql.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_other_cost FROM expense_records WHERE batch = $1`,
      [batch]
    );
    const otherCost = parseFloat(otherCostResult[0].total_other_cost);

    // 3. Sum revenue from sales_records
    const revenueResult = await sql.query(
      `SELECT COALESCE(SUM(CAST(total AS NUMERIC)), 0) AS total_revenue FROM sales_records WHERE batch = $1`,
      [batch]
    );
    const revenue = parseFloat(revenueResult[0].total_revenue);

    // 4. Calculate total costs and profit
    const totalCost = feedCost + otherCost;
    const netProfit = revenue - totalCost;

    // 5. Weight gained (from weight_records)
    const weightResult = await sql.query(
      `SELECT COALESCE(MAX(weight_kg), 0) AS max_weight, COALESCE(MIN(weight_kg), 0) AS min_weight FROM weight_records WHERE batch = $1`,
      [batch]
    );
    const weightGained = parseFloat(weightResult[0].max_weight) - parseFloat(weightResult[0].min_weight);

    // 6. Cost of Production (CoP) per kg
    const copPerKg = weightGained > 0 ? (totalCost / weightGained).toFixed(2) : null;

    // 7. Get category breakdown from expense_records for this batch
    const breakdownResult = await sql.query(
      `SELECT category, COALESCE(SUM(amount), 0) AS total_amount FROM expense_records WHERE batch = $1 GROUP BY category`,
      [batch]
    );

    // Combine feed cost into breakdown
    const breakdown = [
      { category: 'Feed', amount: feedCost },
      ...breakdownResult.map(row => ({
        category: row.category,
        amount: parseFloat(row.total_amount)
      }))
    ];

    // 8. Fetch detailed transaction log (expenses + sales) for this batch
    const expensesList = await sql.query(
      `SELECT 'Expense' AS type, date, category AS label, amount, description FROM expense_records WHERE batch = $1`,
      [batch]
    );
    const salesList = await sql.query(
      `SELECT 'Sale' AS type, date, customer AS label, CAST(total AS NUMERIC) AS amount, invoice AS description FROM sales_records WHERE batch = $1`,
      [batch]
    );
    
    // Sort transactions by date descending
    const transactions = [
      ...expensesList.map(e => ({ ...e, amount: parseFloat(e.amount), date: e.date.toString() })),
      ...salesList.map(s => ({ ...s, amount: parseFloat(s.amount), date: s.date.toString() }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      batch,
      feed_cost: feedCost,
      other_cost: otherCost,
      total_cost: totalCost,
      revenue,
      net_profit: netProfit,
      weight_gained_kg: weightGained,
      cop_per_kg: copPerKg !== null ? parseFloat(copPerKg) : 'Insufficient weight data',
      breakdown,
      transactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});


// For local testing
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;

