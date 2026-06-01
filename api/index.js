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
    'weight_records'
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
    'weight_records'
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

// For local testing
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

export default app;

