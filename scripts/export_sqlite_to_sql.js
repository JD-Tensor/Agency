import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'server/data/agency.db');
if (!fs.existsSync(dbPath)) {
  console.error('Database not found at', dbPath);
  process.exit(1);
}

const db = new Database(dbPath);

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

let sqlOutput = `-- =============================================================================
-- JANA & DAS ENGINEERING PARTNERS - SUPABASE SEED DATA EXPORT
-- Generated automatically from server/data/agency.db
-- =============================================================================\n\n`;

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  // check if string is JSON
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return `'${trimmed.replace(/'/g, "''")}'::jsonb`;
      } catch (e) {
        // regular string
      }
    }
    return `'${val.replace(/'/g, "''")}'`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

for (const tableName of tables) {
  const rows = db.prepare(`SELECT * FROM ${tableName}`).all();
  if (rows.length === 0) continue;

  sqlOutput += `-- Data for ${tableName} (${rows.length} rows)\n`;
  for (const row of rows) {
    const keys = Object.keys(row);
    const escapedCols = keys.map(k => `"${k}"`).join(', ');
    const escapedVals = keys.map(k => escapeSql(row[k])).join(', ');
    sqlOutput += `INSERT INTO public.${tableName} (${escapedCols}) VALUES (${escapedVals}) ON CONFLICT ("${keys[0]}") DO UPDATE SET ${keys.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ')};\n`;
  }
  sqlOutput += `\n`;
}

const outputPath = path.resolve(process.cwd(), 'supabase/seed.sql');
fs.writeFileSync(outputPath, sqlOutput);
console.log(`Successfully generated ${outputPath} with data from all 17 tables!`);

