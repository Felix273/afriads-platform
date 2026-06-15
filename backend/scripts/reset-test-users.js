#!/usr/bin/env node

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ quiet: true });

const password = process.env.TEST_USER_PASSWORD || 'AfriAdsTest123!';
const isProduction = process.env.NODE_ENV === 'production';

const databaseConfig = process.env.DATABASE_URL ? {
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
} : {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
};

const testUsers = [
  {
    email: 'admin@afriads.com',
    user_type: 'admin',
    first_name: 'Admin',
    last_name: 'User',
    company_name: null,
    balance: 0,
  },
  {
    email: 'publisher@fentech.co.ke',
    user_type: 'publisher',
    first_name: 'Fentech',
    last_name: 'Publisher',
    company_name: 'Fentech Digital',
    balance: 0,
  },
  {
    email: 'advertiser@test.afriads.com',
    user_type: 'advertiser',
    first_name: 'Test',
    last_name: 'Advertiser',
    company_name: 'AfriAds Demo Brand',
    balance: 1000,
  },
];

async function resetTestUsers() {
  const pool = new Pool({
    ...databaseConfig,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '30000', 10),
  });

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (
         email,
         password_hash,
         user_type,
         first_name,
         last_name,
         company_name,
         balance,
         status
       )
       SELECT *
       FROM jsonb_to_recordset($1::jsonb) AS u(
         email text,
         password_hash text,
         user_type text,
         first_name text,
         last_name text,
         company_name text,
         balance numeric,
         status text
       )
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         user_type = EXCLUDED.user_type,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         company_name = EXCLUDED.company_name,
         balance = EXCLUDED.balance,
         status = 'active',
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, email, user_type, balance, status
       `,
      [
        JSON.stringify(testUsers.map((user) => ({
          ...user,
          password_hash: passwordHash,
          status: 'active',
        }))),
      ]
    );

    console.table(result.rows);
    console.log(`Test users ready. Temporary password: ${password}`);
  } finally {
    await pool.end();
  }
}

resetTestUsers().catch((error) => {
  console.error('Failed to reset test users:', error.message || error);
  process.exit(1);
});
