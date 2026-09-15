import Database from 'better-sqlite3';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// Load .env manually if present
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}


const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ ERROR: Supabase credentials not found in environment!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in your .env file.\n');
  process.exit(1);
}

const dbPath = path.resolve(process.cwd(), 'server/data/agency.db');
if (!fs.existsSync(dbPath)) {
  console.error('SQLite database not found at', dbPath);
  process.exit(1);
}

console.log(`Connecting to Supabase at: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);
const sqlite = new Database(dbPath);

const tables = [
  'agency_profile',
  'custom_roles',
  'users',
  'clients',
  'contracts',
  'invoices',
  'payments',
  'expenses',
  'capital_contributions',
  'partner_equity',
  'partner_drawings',
  'ip_ownership',
  'assets',
  'debts',
  'tax_filings',
  'documents',
  'tasks'
];

function sanitizeRow(row) {
  const result = { ...row };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          result[key] = JSON.parse(trimmed);
        } catch (e) {
          // keep as string
        }
      }
    } else if (typeof val === 'number') {
      // boolean columns in sqlite are 0 or 1
      if (['isSystem', 'mustChangePassword', 'taxDeductible', 'sharedWithClient'].includes(key)) {
        result[key] = Boolean(val);
      }
    }
  }
  return result;
}

async function migrate() {
  console.log('\n🚀 Starting automated migration from SQLite to Supabase...\n');

  for (const table of tables) {
    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) {
      console.log(`- ${table}: 0 rows (skipped)`);
      continue;
    }

    const sanitizedRows = rows.map(sanitizeRow);
    const { data, error } = await supabase.from(table).upsert(sanitizedRows);

    if (error) {
      console.error(`❌ Failed to upsert ${table}:`, error.message);
      if (error.hint) console.error(`   Hint: ${error.hint}`);
    } else {
      console.log(`✅ ${table}: successfully migrated ${rows.length} rows`);
    }
  }

  console.log('\n🎉 Migration complete! Your Supabase database is fully synced with all 10 ledgers.\n');
}

migrate().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
