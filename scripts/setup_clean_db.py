#!/usr/bin/env python3
import sqlite3
import json
import os
from datetime import datetime

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
data_dir = os.path.join(base_dir, 'server', 'data')
os.makedirs(data_dir, exist_ok=True)
db_path = os.path.join(data_dir, 'agency.db')

if os.path.exists(db_path):
    os.remove(db_path)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.executescript("""
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS agency_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  address TEXT,
  cityStateZip TEXT,
  country TEXT,
  taxId TEXT,
  defaultCurrency TEXT,
  currencySymbol TEXT,
  bankDetails TEXT,
  primarySigner TEXT,
  updatedAt TEXT
);

CREATE TABLE IF NOT EXISTS custom_roles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL,
  isSystem INTEGER DEFAULT 0,
  permissions TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatarUrl TEXT,
  role TEXT NOT NULL,
  roleLevel INTEGER NOT NULL,
  status TEXT NOT NULL,
  paymentType TEXT,
  paymentAmount REAL,
  currency TEXT DEFAULT 'USD',
  skills TEXT,
  joinedDate TEXT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  temporaryPassword TEXT,
  mustChangePassword INTEGER DEFAULT 0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  companyName TEXT NOT NULL,
  contactName TEXT NOT NULL,
  contactTitle TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  avatarUrl TEXT,
  username TEXT UNIQUE,
  password TEXT,
  temporaryPassword TEXT,
  mustChangePassword INTEGER DEFAULT 0,
  orders TEXT,
  sharedDocumentIds TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  contractNumber TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  clientId TEXT NOT NULL,
  clientName TEXT NOT NULL,
  type TEXT NOT NULL,
  contractValue REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  signedDate TEXT,
  partnerInCharge TEXT NOT NULL,
  status TEXT NOT NULL,
  attachedDocId TEXT,
  termsSummary TEXT,
  ipOwnershipClause TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoiceNumber TEXT UNIQUE NOT NULL,
  clientId TEXT NOT NULL,
  clientName TEXT NOT NULL,
  contractId TEXT,
  issueDate TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  items TEXT NOT NULL,
  subtotal REAL NOT NULL,
  taxPercent REAL DEFAULT 0,
  taxAmount REAL DEFAULT 0,
  discountAmount REAL DEFAULT 0,
  grandTotal REAL NOT NULL,
  paidAmount REAL DEFAULT 0,
  status TEXT NOT NULL,
  paymentTerms TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  paymentNumber TEXT UNIQUE NOT NULL,
  invoiceId TEXT,
  contractId TEXT,
  clientId TEXT NOT NULL,
  clientName TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  paymentDate TEXT NOT NULL,
  paymentMethod TEXT NOT NULL,
  transactionRef TEXT,
  depositingBank TEXT,
  receiptDocId TEXT,
  notes TEXT,
  recordedBy TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  expenseNumber TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  vendor TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  date TEXT NOT NULL,
  paidBy TEXT NOT NULL,
  reimbursementStatus TEXT NOT NULL,
  taxDeductible INTEGER DEFAULT 1,
  receiptAttachmentName TEXT,
  notes TEXT,
  recordedBy TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS capital_contributions (
  id TEXT PRIMARY KEY,
  partnerName TEXT NOT NULL,
  partnerId TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  date TEXT NOT NULL,
  contributionType TEXT NOT NULL,
  transactionRef TEXT,
  bankAccount TEXT,
  notes TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partner_equity (
  partnerId TEXT PRIMARY KEY,
  partnerName TEXT NOT NULL,
  designation TEXT NOT NULL,
  email TEXT NOT NULL,
  ownershipPercentage REAL NOT NULL,
  profitSharePercentage REAL NOT NULL,
  initialCapitalContribution REAL DEFAULT 0,
  totalContributed REAL DEFAULT 0,
  totalDrawings REAL DEFAULT 0,
  netCapitalBalance REAL DEFAULT 0,
  signatureImage TEXT,
  lastUpdated TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partner_drawings (
  id TEXT PRIMARY KEY,
  partnerId TEXT NOT NULL,
  partnerName TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  date TEXT NOT NULL,
  paymentMethod TEXT,
  transactionRef TEXT,
  withdrawingBank TEXT,
  notes TEXT,
  approvedByPartner TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ip_ownership (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  repositoryUrl TEXT NOT NULL,
  commitHashOrVersion TEXT,
  ownershipType TEXT NOT NULL,
  clientAssignmentId TEXT,
  clientName TEXT,
  primaryAuthorPartner TEXT NOT NULL,
  registrationDate TEXT NOT NULL,
  legalStatus TEXT NOT NULL,
  licenseTerms TEXT,
  summary TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  assetNumber TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchaseDate TEXT NOT NULL,
  purchaseCost REAL NOT NULL,
  currentBookValue REAL NOT NULL,
  depreciationRatePercent REAL NOT NULL,
  assignedTo TEXT,
  serialNumberOrKey TEXT,
  condition TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS debts (
  id TEXT PRIMARY KEY,
  debtNumber TEXT UNIQUE NOT NULL,
  creditor TEXT NOT NULL,
  debtType TEXT NOT NULL,
  principalAmount REAL NOT NULL,
  currentBalance REAL NOT NULL,
  interestRatePercent REAL NOT NULL,
  repaymentTermMonths INTEGER,
  monthlyPayment REAL,
  startDate TEXT NOT NULL,
  maturityDate TEXT,
  status TEXT NOT NULL,
  notes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tax_filings (
  id TEXT PRIMARY KEY,
  filingNumber TEXT UNIQUE NOT NULL,
  taxType TEXT NOT NULL,
  title TEXT NOT NULL,
  fiscalYear TEXT NOT NULL,
  periodOrQuarter TEXT NOT NULL,
  dueDate TEXT NOT NULL,
  filingDate TEXT,
  ackNumberOrArn TEXT,
  taxLiabilityAmount REAL NOT NULL,
  taxPaidAmount REAL DEFAULT 0,
  status TEXT NOT NULL,
  signedByPartner TEXT NOT NULL,
  auditorNotes TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  docNumber TEXT UNIQUE NOT NULL,
  clientName TEXT NOT NULL,
  clientId TEXT,
  status TEXT NOT NULL,
  sharedWithClient INTEGER DEFAULT 0,
  payload TEXT NOT NULL,
  agencySnapshot TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  freelancerId TEXT,
  freelancerName TEXT,
  projectName TEXT,
  clientName TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  dueDate TEXT,
  estimatedHours REAL,
  actualHours REAL,
  deliverables TEXT,
  createdAt TEXT NOT NULL
);
""")

now_str = datetime.utcnow().isoformat() + "Z"

# 1. Agency Profile
cursor.execute("""
INSERT INTO agency_profile (
  id, name, tagline, email, phone, website, address, cityStateZip, country, taxId, 
  defaultCurrency, currencySymbol, bankDetails, primarySigner, updatedAt
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (
  'firm-profile-1',
  'Jana & Das Engineering Partners',
  'Specialized Software Engineering, Systems Architecture & Digital Products',
  'contact@janadas.agency',
  '+91 98765 43210',
  'https://janadas.agency',
  'Tech Park Gateway, Sector V',
  'Kolkata, WB 700091',
  'India',
  'IN-GSTIN-19AAEFJ9024K1Z8',
  'USD',
  '$',
  json.dumps({
    'bankName': 'HDFC Commercial Banking',
    'accountHolder': 'Jana and Das Engineering Partners',
    'accountNumber': '50200084920194',
    'routingOrSwift': 'HDFCINBB',
    'iban': 'IN92HDFC00050200084920194',
    'notes': 'NEFT / RTGS / Swift wire remittance preferred. Reference invoice number.'
  }),
  json.dumps({
    'name': 'Subhadip Jana',
    'title': 'Senior Managing Partner',
    'email': 'subhadip@janadas.agency',
    'signatureText': 'Subhadip Jana',
    'signatureImage': "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M25,52 C35,20 42,10 50,26 C56,38 62,56 68,54 C76,52 82,34 90,32 C98,30 102,46 110,44 C120,40 130,22 142,36 C150,45 158,55 168,48 C178,42 186,28 196,30 C208,32 214,48 228,42 C240,36 250,20 262,38 C270,50 282,54 298,32' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/><path d='M35,62 C90,56 180,50 275,46' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
  }),
  now_str
))

# 2. Roles
roles = [
  (
    'role-partner', 'partner',
    'Founding Partner with unrestricted governance, equity, financial authority, and full role administration.',
    100, 1, json.dumps({
      'manage_firm_equity': True, 'manage_roles': True, 'manage_contracts': True, 'manage_invoices': True,
      'manage_payments': True, 'manage_expenses': True, 'manage_ip': True, 'manage_assets': True,
      'manage_debts': True, 'manage_taxes': True, 'manage_team': True, 'manage_clients': True,
      'manage_tasks': True, 'create_documents': True
    }), now_str
  ),
  (
    'role-admin', 'admin',
    'Operations administrator. Manages invoices, expenses, team, clients, and role assignments below admin.',
    80, 1, json.dumps({
      'manage_firm_equity': False, 'manage_roles': True, 'manage_contracts': True, 'manage_invoices': True,
      'manage_payments': True, 'manage_expenses': True, 'manage_ip': True, 'manage_assets': True,
      'manage_debts': True, 'manage_taxes': False, 'manage_team': True, 'manage_clients': True,
      'manage_tasks': True, 'create_documents': True
    }), now_str
  ),
  (
    'role-manager', 'manager',
    'Project & Client delivery lead. Oversees contracts, clients, tasks, and team assignments below manager.',
    60, 1, json.dumps({
      'manage_firm_equity': False, 'manage_roles': True, 'manage_contracts': True, 'manage_invoices': False,
      'manage_payments': False, 'manage_expenses': False, 'manage_ip': False, 'manage_assets': False,
      'manage_debts': False, 'manage_taxes': False, 'manage_team': True, 'manage_clients': True,
      'manage_tasks': True, 'create_documents': True
    }), now_str
  ),
  (
    'role-developer', 'developer',
    'Engineering contributor. Builds software features, works on assigned tasks, and logs code deliverables.',
    40, 1, json.dumps({
      'manage_firm_equity': False, 'manage_roles': False, 'manage_contracts': False, 'manage_invoices': False,
      'manage_payments': False, 'manage_expenses': False, 'manage_ip': False, 'manage_assets': False,
      'manage_debts': False, 'manage_taxes': False, 'manage_team': False, 'manage_clients': False,
      'manage_tasks': True, 'create_documents': False
    }), now_str
  ),
  (
    'role-designer', 'designer',
    'Creative design contributor. Delivers UX specifications, design systems, and visual assets.',
    40, 1, json.dumps({
      'manage_firm_equity': False, 'manage_roles': False, 'manage_contracts': False, 'manage_invoices': False,
      'manage_payments': False, 'manage_expenses': False, 'manage_ip': False, 'manage_assets': False,
      'manage_debts': False, 'manage_taxes': False, 'manage_team': False, 'manage_clients': False,
      'manage_tasks': True, 'create_documents': False
    }), now_str
  ),
  (
    'role-auditor', 'auditor',
    'Compliance and financial auditor. Comprehensive read-only inspection of all ledgers, taxes, equity, and contracts.',
    30, 1, json.dumps({
      'manage_firm_equity': False, 'manage_roles': False, 'manage_contracts': False, 'manage_invoices': False,
      'manage_payments': False, 'manage_expenses': False, 'manage_ip': False, 'manage_assets': False,
      'manage_debts': False, 'manage_taxes': False, 'manage_team': False, 'manage_clients': False,
      'manage_tasks': False, 'create_documents': False
    }), now_str
  )
]

cursor.executemany("""
INSERT INTO custom_roles (id, name, description, level, isSystem, permissions, createdAt)
VALUES (?, ?, ?, ?, ?, ?, ?)
""", roles)

# 3. Founding Partners
partners = [
  (
    'usr-subhadip', 'Subhadip Jana', 'subhadipjana866@gmail.com',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'Senior Managing Partner', 100, 'active', 'fixed', 0, 'USD',
    json.dumps(['Systems Architecture', 'Distributed Infrastructure', 'Partnership Governance', 'Product Engineering']),
    '2025-01-01', 'subhadip866', 'subhadip2003#', None, 0, 'Co-founding Senior Managing Partner'
  ),
  (
    'usr-shayan', 'Shayan Das', 'shayandas267@gmail.com',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'Senior Managing Partner', 100, 'active', 'fixed', 0, 'USD',
    json.dumps(['Product Design', 'Commercial Strategy', 'Engineering Leadership', 'Client Partnerships']),
    '2025-01-01', 'shayan267', 'shayan2003#', None, 0, 'Co-founding Senior Managing Partner'
  )
]

cursor.executemany("""
INSERT INTO users (
  id, name, email, avatarUrl, role, roleLevel, status, paymentType, paymentAmount, currency,
  skills, joinedDate, username, password, temporaryPassword, mustChangePassword, notes
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", partners)

# 4. Partner Equity Ledger (Subhadip & Shayan 50/50 with 0 balance)
equity = [
  (
    'usr-subhadip', 'Subhadip Jana', 'Senior Managing Partner', 'subhadipjana866@gmail.com',
    50.0, 50.0, 0, 0, 0, 0,
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M25,52 C35,20 42,10 50,26 C56,38 62,56 68,54 C76,52 82,34 90,32 C98,30 102,46 110,44 C120,40 130,22 142,36 C150,45 158,55 168,48 C178,42 186,28 196,30 C208,32 214,48 228,42 C240,36 250,20 262,38 C270,50 282,54 298,32' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/><path d='M35,62 C90,56 180,50 275,46' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>",
    now_str
  ),
  (
    'usr-shayan', 'Shayan Das', 'Senior Managing Partner', 'shayandas267@gmail.com',
    50.0, 50.0, 0, 0, 0, 0,
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M30,45 C45,25 55,20 70,35 C80,48 90,55 105,40 C120,25 135,20 150,38 C165,52 175,60 190,45 C205,30 220,25 240,40 C255,50 270,52 285,35' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/><path d='M40,65 C100,58 190,52 280,48' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>",
    now_str
  )
]

cursor.executemany("""
INSERT INTO partner_equity (
  partnerId, partnerName, designation, email, ownershipPercentage, profitSharePercentage,
  initialCapitalContribution, totalContributed, totalDrawings, netCapitalBalance, signatureImage, lastUpdated
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", equity)

conn.commit()
print("SQLite database successfully initialized and empty.")

# Generate Supabase seed.sql
tables = [
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
]

sql_out = """-- =============================================================================
-- JANA & DAS ENGINEERING PARTNERS - CLEAN SUPABASE SEED DATA
-- Generated with 0 sample documents, 0 sample invoices, 0 sample contracts
-- =============================================================================\n\n"""

def escape_val(v):
    if v is None:
        return 'NULL'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, bool):
        return 'true' if v else 'false'
    s = str(v)
    # Check if JSON
    trimmed = s.strip()
    if (trimmed.startswith('{') and trimmed.endswith('}')) or (trimmed.startswith('[') and trimmed.endswith(']')):
        try:
            json.loads(trimmed)
            clean_json = trimmed.replace("'", "''")
            return f"'{clean_json}'::jsonb"
        except:
            pass
    clean_str = s.replace("'", "''")
    return f"'{clean_str}'"

for t in tables:
    cursor.execute(f"SELECT * FROM {t}")
    rows = cursor.fetchall()
    if not rows:
        continue
    col_names = [d[0] for d in cursor.description]
    sql_out += f"-- Data for {t} ({len(rows)} rows)\n"
    for row in rows:
        escaped_cols = ", ".join(f'"{c}"' for c in col_names)
        escaped_vals = ", ".join(escape_val(v) for v in row)
        set_clause = ", ".join(f'"{c}" = EXCLUDED."{c}"' for c in col_names)
        sql_out += f'INSERT INTO public.{t} ({escaped_cols}) VALUES ({escaped_vals}) ON CONFLICT ("{col_names[0]}") DO UPDATE SET {set_clause};\n'
    sql_out += "\n"

conn.close()

seed_path = os.path.join(base_dir, 'supabase', 'seed.sql')
with open(seed_path, 'w') as f:
    f.write(sql_out)

print(f"Clean seed.sql generated at: {seed_path}")
