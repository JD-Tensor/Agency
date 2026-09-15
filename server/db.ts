import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'server/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'agency.db');
export const db = new Database(dbPath);

// Enable WAL mode for high performance concurrent reads and writes
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
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
      email TEXT NOT NULL,
      avatarUrl TEXT,
      role TEXT NOT NULL,
      roleLevel INTEGER NOT NULL DEFAULT 40,
      status TEXT NOT NULL DEFAULT 'active',
      paymentType TEXT,
      paymentAmount REAL,
      currency TEXT DEFAULT 'USD',
      skills TEXT,
      joinedDate TEXT,
      username TEXT UNIQUE NOT NULL,
      password TEXT,
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
      username TEXT UNIQUE NOT NULL,
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
      recordedBy TEXT,
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
      reimbursementStatus TEXT DEFAULT 'not_applicable',
      taxDeductible INTEGER DEFAULT 1,
      receiptAttachmentName TEXT,
      notes TEXT,
      recordedBy TEXT,
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
      initialCapitalContribution REAL NOT NULL,
      totalContributed REAL NOT NULL,
      totalDrawings REAL DEFAULT 0,
      netCapitalBalance REAL NOT NULL,
      signatureImage TEXT,
      lastUpdated TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS partner_drawings (
      id TEXT PRIMARY KEY,
      partnerName TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      purpose TEXT,
      transactionRef TEXT,
      approvedBy TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ip_ownership (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      repositoryUrl TEXT,
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
      depreciationRatePercent REAL DEFAULT 15,
      assignedTo TEXT,
      serialNumberOrKey TEXT,
      condition TEXT DEFAULT 'active_excellent',
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
      interestRatePercent REAL DEFAULT 0,
      repaymentTermMonths INTEGER,
      monthlyPayment REAL,
      startDate TEXT,
      maturityDate TEXT,
      status TEXT DEFAULT 'active',
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
      taxLiabilityAmount REAL DEFAULT 0,
      taxPaidAmount REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      signedByPartner TEXT NOT NULL,
      auditorNotes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      docNumber TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      clientName TEXT,
      clientId TEXT,
      status TEXT NOT NULL,
      payload TEXT NOT NULL,
      agencySnapshot TEXT NOT NULL,
      sharedWithClient INTEGER DEFAULT 0,
      sharedAt TEXT,
      clientNotes TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      freelancerId TEXT NOT NULL,
      freelancerName TEXT,
      projectName TEXT,
      clientName TEXT,
      priority TEXT,
      status TEXT,
      dueDate TEXT,
      estimatedHours REAL,
      deliverableUrl TEXT,
      deliverableNotes TEXT,
      submittedAt TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  seedInitialData();
}

function seedInitialData() {
  const profileCount = db.prepare('SELECT COUNT(*) as c FROM agency_profile').get() as { c: number };
  if (profileCount.c > 0) return; // Already seeded

  const now = new Date().toISOString();

  // 1. Firm Profile with Subhadip Jana and Shayan Das
  db.prepare(`
    INSERT INTO agency_profile (
      id, name, tagline, email, phone, website, address, cityStateZip, country, taxId, 
      defaultCurrency, currencySymbol, bankDetails, primarySigner, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
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
    JSON.stringify({
      bankName: 'HDFC Commercial Banking',
      accountHolder: 'Jana and Das Engineering Partners',
      accountNumber: '50200084920194',
      routingOrSwift: 'HDFCINBB',
      iban: 'IN92HDFC00050200084920194',
      notes: 'NEFT / RTGS / Swift wire remittance preferred. Reference invoice number.'
    }),
    JSON.stringify({
      name: 'Subhadip Jana',
      title: 'Senior Managing Partner',
      email: 'subhadip@janadas.agency',
      signatureText: 'Subhadip Jana',
      signatureImage: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M25,52 C35,20 42,10 50,26 C56,38 62,56 68,54 C76,52 82,34 90,32 C98,30 102,46 110,44 C120,40 130,22 142,36 C150,45 158,55 168,48 C178,42 186,28 196,30 C208,32 214,48 228,42 C240,36 250,20 262,38 C270,50 282,54 298,32' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/><path d='M35,62 C90,56 180,50 275,46' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>"
    }),
    now
  );

  // 2. Roles & Permissions (Partner, Admin, Manager, Developer, Designer, Auditor)
  const roles = [
    {
      id: 'role-partner',
      name: 'partner',
      description: 'Founding Partner with unrestricted governance, equity, financial authority, and full role administration.',
      level: 100,
      isSystem: 1,
      permissions: {
        manage_firm_equity: true,
        manage_roles: true,
        manage_contracts: true,
        manage_invoices: true,
        manage_payments: true,
        manage_expenses: true,
        manage_ip: true,
        manage_assets: true,
        manage_debts: true,
        manage_taxes: true,
        manage_team: true,
        manage_clients: true,
        manage_tasks: true,
        create_documents: true
      }
    },
    {
      id: 'role-admin',
      name: 'admin',
      description: 'Operations administrator. Manages invoices, expenses, team, clients, and role assignments below admin.',
      level: 80,
      isSystem: 1,
      permissions: {
        manage_firm_equity: false,
        manage_roles: true,
        manage_contracts: true,
        manage_invoices: true,
        manage_payments: true,
        manage_expenses: true,
        manage_ip: true,
        manage_assets: true,
        manage_debts: true,
        manage_taxes: false,
        manage_team: true,
        manage_clients: true,
        manage_tasks: true,
        create_documents: true
      }
    },
    {
      id: 'role-manager',
      name: 'manager',
      description: 'Project & Client delivery lead. Oversees contracts, clients, tasks, and team assignments below manager.',
      level: 60,
      isSystem: 1,
      permissions: {
        manage_firm_equity: false,
        manage_roles: true,
        manage_contracts: true,
        manage_invoices: false,
        manage_payments: false,
        manage_expenses: false,
        manage_ip: false,
        manage_assets: false,
        manage_debts: false,
        manage_taxes: false,
        manage_team: true,
        manage_clients: true,
        manage_tasks: true,
        create_documents: true
      }
    },
    {
      id: 'role-developer',
      name: 'developer',
      description: 'Engineering contributor. Builds software features, works on assigned tasks, and logs code deliverables.',
      level: 40,
      isSystem: 1,
      permissions: {
        manage_firm_equity: false,
        manage_roles: false,
        manage_contracts: false,
        manage_invoices: false,
        manage_payments: false,
        manage_expenses: false,
        manage_ip: false,
        manage_assets: false,
        manage_debts: false,
        manage_taxes: false,
        manage_team: false,
        manage_clients: false,
        manage_tasks: true,
        create_documents: false
      }
    },
    {
      id: 'role-designer',
      name: 'designer',
      description: 'Creative design contributor. Delivers UX specifications, design systems, and visual assets.',
      level: 40,
      isSystem: 1,
      permissions: {
        manage_firm_equity: false,
        manage_roles: false,
        manage_contracts: false,
        manage_invoices: false,
        manage_payments: false,
        manage_expenses: false,
        manage_ip: false,
        manage_assets: false,
        manage_debts: false,
        manage_taxes: false,
        manage_team: false,
        manage_clients: false,
        manage_tasks: true,
        create_documents: false
      }
    },
    {
      id: 'role-auditor',
      name: 'auditor',
      description: 'Compliance and financial auditor. Comprehensive read-only inspection of all ledgers, taxes, equity, and contracts.',
      level: 30,
      isSystem: 1,
      permissions: {
        manage_firm_equity: false,
        manage_roles: false,
        manage_contracts: false,
        manage_invoices: false,
        manage_payments: false,
        manage_expenses: false,
        manage_ip: false,
        manage_assets: false,
        manage_debts: false,
        manage_taxes: false,
        manage_team: false,
        manage_clients: false,
        manage_tasks: false,
        create_documents: false
      }
    }
  ];

  const insertRole = db.prepare(`
    INSERT INTO custom_roles (id, name, description, level, isSystem, permissions, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of roles) {
    insertRole.run(r.id, r.name, r.description, r.level, r.isSystem, JSON.stringify(r.permissions), now);
  }

  // 3. Founding Partners and Team Members
  const users = [
    {
      id: 'usr-subhadip',
      name: 'Subhadip Jana',
      email: 'subhadip@janadas.agency',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      role: 'partner',
      roleLevel: 100,
      status: 'active',
      paymentType: 'fixed',
      paymentAmount: 0,
      currency: 'USD',
      skills: ['Systems Architecture', 'Distributed Infrastructure', 'Partnership Governance', 'Product Engineering'],
      joinedDate: '2025-01-01',
      username: 'subhadip',
      password: 'password123',
      mustChangePassword: 0,
      notes: 'Co-founding Equity Partner & Chief Technology Officer'
    },
    {
      id: 'usr-shayan',
      name: 'Shayan Das',
      email: 'shayan@janadas.agency',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      role: 'partner',
      roleLevel: 100,
      status: 'active',
      paymentType: 'fixed',
      paymentAmount: 0,
      currency: 'USD',
      skills: ['Product Design', 'Commercial Strategy', 'Engineering Leadership', 'Client Partnerships'],
      joinedDate: '2025-01-01',
      username: 'shayan',
      password: 'password123',
      mustChangePassword: 0,
      notes: 'Co-founding Equity Partner & Managing Director'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, avatarUrl, role, roleLevel, status, paymentType, paymentAmount, currency, 
      skills, joinedDate, username, password, mustChangePassword, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(
      u.id, u.name, u.email, u.avatarUrl, u.role, u.roleLevel, u.status, u.paymentType, u.paymentAmount, 
      u.currency, JSON.stringify(u.skills), u.joinedDate, u.username, u.password, u.mustChangePassword, u.notes
    );
  }

  // 4. Partner Equity Ledger (Subhadip Jana & Shayan Das - 50/50 Initial Foundation)
  const insertEquity = db.prepare(`
    INSERT INTO partner_equity (
      partnerId, partnerName, designation, email, ownershipPercentage, profitSharePercentage, 
      initialCapitalContribution, totalContributed, totalDrawings, netCapitalBalance, signatureImage, lastUpdated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertEquity.run(
    'usr-subhadip',
    'Subhadip Jana',
    'Founding Partner & CTO',
    'subhadip@janadas.agency',
    50.0,
    50.0,
    0,
    0,
    0,
    0,
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M25,52 C35,20 42,10 50,26 C56,38 62,56 68,54 C76,52 82,34 90,32 C98,30 102,46 110,44 C120,40 130,22 142,36 C150,45 158,55 168,48 C178,42 186,28 196,30 C208,32 214,48 228,42 C240,36 250,20 262,38 C270,50 282,54 298,32' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/><path d='M35,62 C90,56 180,50 275,46' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>",
    now
  );

  insertEquity.run(
    'usr-shayan',
    'Shayan Das',
    'Founding Partner & MD',
    'shayan@janadas.agency',
    50.0,
    50.0,
    0,
    0,
    0,
    0,
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 80' width='320' height='80'><path d='M30,45 C45,25 55,20 70,35 C80,48 90,55 105,40 C120,25 135,20 150,38 C165,52 175,60 190,45 C205,30 220,25 240,40 C255,50 270,52 285,35' fill='none' stroke='%230f172a' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/><path d='M40,65 C100,58 190,52 280,48' fill='none' stroke='%230f172a' stroke-width='2' stroke-linecap='round'/></svg>",
    now
  );

  // All other tables (capital_contributions, clients, contracts, invoices, payments, expenses, 
  // ip_ownership, assets, debts, tax_filings, tasks, documents) start 100% EMPTY for clean production usage.
}
