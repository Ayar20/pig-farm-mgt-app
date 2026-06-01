import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function run() {
  try {
    // Insert lightup0002@gmail.com as admin
    await sql.query(
      `INSERT INTO user_roles (email, role) 
       VALUES ('lightup0002@gmail.com', 'admin') 
       ON CONFLICT (email) 
       DO UPDATE SET role = 'admin'`
    );
    console.log("Successfully set lightup0002@gmail.com to admin in database!");
  } catch (err) {
    console.error("Error setting admin:", err);
  }
}

run();
