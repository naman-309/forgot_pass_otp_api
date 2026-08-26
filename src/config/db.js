import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


export const connectDB = async () => {
  try {
    await pool.query("SELECT 1");

    console.log("DATABASE CONNECTED!!!!");
  } catch (error) {
    console.log("DATABASE CONNECTION FAILED!!!!");
    console.log(error.message);

    process.exit(1);
  }
};


export default pool;