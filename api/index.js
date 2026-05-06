const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

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
    'staff_records'
  ];
  
  const { table } = req.params;
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  try {
    const data = await sql(`SELECT * FROM ${table} ORDER BY id DESC`);
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
    'staff_records'
  ];
  
  const { table } = req.params;
  if (!allowedTables.includes(table)) {
    return res.status(400).json({ error: 'Invalid table' });
  }

  try {
    const data = req.body;
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    // We construct the query dynamically but safely since we control keys from req.body 
    // Usually it's better to explicitly define columns but this serves the generic RecordPage
    const columns = keys.join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    
    const result = await sql(`INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`, values);
    
    res.json(result[0]);
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

module.exports = app;
