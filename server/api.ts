import { Router } from 'express';
import { db, initDatabase } from './db.js';
import crypto from 'crypto';

// Initialize DB tables if not created yet
initDatabase();

export const apiRouter = Router();

// Helper to parse JSON fields safely
const parseJson = (str: any, fallback: any = null) => {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
};

// ==========================================
// 1. AGENCY PROFILE
// ==========================================
apiRouter.get('/profile', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM agency_profile LIMIT 1').get() as any;
    if (!row) return res.status(404).json({ error: 'Profile not found' });
    
    res.json({
      ...row,
      bankDetails: parseJson(row.bankDetails, {}),
      primarySigner: parseJson(row.primarySigner, {})
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/profile', (req, res) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();
    
    db.prepare(`
      UPDATE agency_profile SET
        name = ?, tagline = ?, email = ?, phone = ?, website = ?,
        address = ?, cityStateZip = ?, country = ?, taxId = ?,
        defaultCurrency = ?, currencySymbol = ?, bankDetails = ?,
        primarySigner = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      data.name, data.tagline, data.email, data.phone, data.website,
      data.address, data.cityStateZip, data.country, data.taxId,
      data.defaultCurrency, data.currencySymbol,
      JSON.stringify(data.bankDetails || {}),
      JSON.stringify(data.primarySigner || {}),
      now,
      data.id || 'agency-1'
    );

    res.json({ success: true, updatedAt: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. ROLES & RBAC
// ==========================================
apiRouter.get('/roles', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM custom_roles ORDER BY level DESC').all() as any[];
    const roles = rows.map(r => ({
      ...r,
      isSystem: Boolean(r.isSystem),
      permissions: parseJson(r.permissions, {})
    }));
    res.json(roles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/roles', (req, res) => {
  try {
    const { name, description, level, permissions, actorLevel } = req.body;
    
    // Strict hierarchy rule: user cannot create a role with level >= their own level
    if (actorLevel !== undefined && level >= actorLevel) {
      return res.status(403).json({ error: 'Cannot create a role with level equal to or higher than your own.' });
    }

    const id = `role-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO custom_roles (id, name, description, level, isSystem, permissions, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description || '', level, 0, JSON.stringify(permissions || {}), now);

    res.json({ id, name, description, level, isSystem: false, permissions, createdAt: now });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/roles/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, level, permissions, actorLevel } = req.body;
    
    const existing = db.prepare('SELECT * FROM custom_roles WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Role not found' });
    if (existing.isSystem) return res.status(400).json({ error: 'System roles cannot be modified' });

    if (actorLevel !== undefined && (existing.level >= actorLevel || level >= actorLevel)) {
      return res.status(403).json({ error: 'Hierarchy violation: cannot edit roles at or above your level' });
    }

    db.prepare(`
      UPDATE custom_roles SET name = ?, description = ?, level = ?, permissions = ?
      WHERE id = ?
    `).run(name, description, level, JSON.stringify(permissions), id);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. USERS / TEAM MEMBERS
// ==========================================
apiRouter.get('/users', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM users ORDER BY roleLevel DESC, name ASC').all() as any[];
    const users = rows.map(u => ({
      ...u,
      skills: parseJson(u.skills, []),
      mustChangePassword: Boolean(u.mustChangePassword)
    }));
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/users', (req, res) => {
  try {
    const data = req.body;
    const { actorLevel } = data;

    // Role hierarchy check
    if (actorLevel !== undefined && data.roleLevel >= actorLevel) {
      return res.status(403).json({ error: 'Hierarchy restriction: You cannot assign a role level equal to or higher than your own' });
    }

    const id = data.id || `usr-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (
        id, name, email, avatarUrl, role, roleLevel, status, paymentType,
        paymentAmount, currency, skills, joinedDate, username, password, temporaryPassword,
        mustChangePassword, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.name, data.email, data.avatarUrl || null, data.role, data.roleLevel || 40,
      data.status || 'active', data.paymentType || 'hourly', data.paymentAmount || 0,
      data.currency || 'USD', JSON.stringify(data.skills || []),
      data.joinedDate || now.split('T')[0],
      data.username, data.password || data.temporaryPassword, data.temporaryPassword || null,
      data.mustChangePassword ? 1 : 0, data.notes || ''
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const { actorLevel } = data;

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'User not found' });

    // Target user check: Cannot edit someone at or above own roleLevel
    if (actorLevel !== undefined && existing.roleLevel >= actorLevel) {
      return res.status(403).json({ error: 'Hierarchy restriction: You cannot modify a user with role level equal to or higher than your own' });
    }
    // Cannot promote someone to or above own level
    if (actorLevel !== undefined && data.roleLevel && data.roleLevel >= actorLevel) {
      return res.status(403).json({ error: 'Hierarchy restriction: You cannot promote someone to or above your role level' });
    }

    db.prepare(`
      UPDATE users SET
        name = ?, email = ?, avatarUrl = ?, role = ?, roleLevel = ?, status = ?,
        paymentType = ?, paymentAmount = ?, currency = ?, skills = ?, notes = ?
      WHERE id = ?
    `).run(
      data.name, data.email, data.avatarUrl || existing.avatarUrl,
      data.role || existing.role, data.roleLevel !== undefined ? data.roleLevel : existing.roleLevel,
      data.status || existing.status, data.paymentType || existing.paymentType,
      data.paymentAmount !== undefined ? data.paymentAmount : existing.paymentAmount,
      data.currency || existing.currency, JSON.stringify(data.skills || []),
      data.notes !== undefined ? data.notes : existing.notes,
      id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const actorLevel = Number(req.query.actorLevel || 0);

    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'User not found' });

    if (existing.roleLevel >= actorLevel) {
      return res.status(403).json({ error: 'Hierarchy restriction: Cannot delete user with equal or higher role level' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. CLIENTS
// ==========================================
apiRouter.get('/clients', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM clients ORDER BY companyName ASC').all() as any[];
    const clients = rows.map(c => ({
      ...c,
      orders: parseJson(c.orders, []),
      sharedDocumentIds: parseJson(c.sharedDocumentIds, []),
      mustChangePassword: Boolean(c.mustChangePassword)
    }));
    res.json(clients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/clients', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `client-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO clients (
        id, companyName, contactName, contactTitle, email, phone, address,
        avatarUrl, username, password, temporaryPassword, mustChangePassword,
        orders, sharedDocumentIds, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.companyName, data.contactName, data.contactTitle || '',
      data.email, data.phone || '', data.address || '', data.avatarUrl || null,
      data.username, data.password || data.temporaryPassword, data.temporaryPassword || null,
      data.mustChangePassword ? 1 : 0, JSON.stringify(data.orders || []),
      JSON.stringify(data.sharedDocumentIds || []), data.notes || '', now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    db.prepare(`
      UPDATE clients SET
        companyName = ?, contactName = ?, contactTitle = ?, email = ?,
        phone = ?, address = ?, orders = ?, sharedDocumentIds = ?, notes = ?
      WHERE id = ?
    `).run(
      data.companyName, data.contactName, data.contactTitle || '',
      data.email, data.phone || '', data.address || '',
      JSON.stringify(data.orders || []),
      JSON.stringify(data.sharedDocumentIds || []),
      data.notes || '',
      id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. CONTRACTS LEDGER (1/10)
// ==========================================
apiRouter.get('/contracts', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM contracts ORDER BY startDate DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/contracts', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `ct-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO contracts (
        id, contractNumber, title, clientId, clientName, type, contractValue,
        currency, startDate, endDate, signedDate, partnerInCharge, status,
        attachedDocId, termsSummary, ipOwnershipClause, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.contractNumber, data.title, data.clientId, data.clientName,
      data.type, data.contractValue, data.currency || 'USD', data.startDate,
      data.endDate, data.signedDate || null, data.partnerInCharge, data.status || 'draft',
      data.attachedDocId || null, data.termsSummary || '', data.ipOwnershipClause || '',
      now, now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/contracts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE contracts SET
        title = ?, clientName = ?, type = ?, contractValue = ?, currency = ?,
        startDate = ?, endDate = ?, signedDate = ?, partnerInCharge = ?,
        status = ?, termsSummary = ?, ipOwnershipClause = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      data.title, data.clientName, data.type, data.contractValue,
      data.currency || 'USD', data.startDate, data.endDate,
      data.signedDate || null, data.partnerInCharge, data.status,
      data.termsSummary, data.ipOwnershipClause, now, id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/contracts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM contracts WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. INVOICES LEDGER (2/10)
// ==========================================
apiRouter.get('/invoices', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM invoices ORDER BY issueDate DESC').all() as any[];
    const invoices = rows.map(i => ({
      ...i,
      items: parseJson(i.items, [])
    }));
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/invoices', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `inv-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO invoices (
        id, invoiceNumber, clientId, clientName, contractId, issueDate,
        dueDate, items, subtotal, taxPercent, taxAmount, discountAmount,
        grandTotal, paidAmount, status, paymentTerms, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.invoiceNumber, data.clientId, data.clientName, data.contractId || null,
      data.issueDate, data.dueDate, JSON.stringify(data.items || []),
      data.subtotal, data.taxPercent || 0, data.taxAmount || 0, data.discountAmount || 0,
      data.grandTotal, data.paidAmount || 0, data.status || 'draft',
      data.paymentTerms || '', data.notes || '', now, now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/invoices/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE invoices SET
        clientName = ?, issueDate = ?, dueDate = ?, items = ?,
        subtotal = ?, taxPercent = ?, taxAmount = ?, discountAmount = ?,
        grandTotal = ?, paidAmount = ?, status = ?, paymentTerms = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      data.clientName, data.issueDate, data.dueDate, JSON.stringify(data.items || []),
      data.subtotal, data.taxPercent || 0, data.taxAmount || 0, data.discountAmount || 0,
      data.grandTotal, data.paidAmount || 0, data.status,
      data.paymentTerms || '', data.notes || '', now, id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/invoices/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. PAYMENTS LEDGER (3/10)
// ==========================================
apiRouter.get('/payments', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM payments ORDER BY paymentDate DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/payments', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `pay-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO payments (
        id, paymentNumber, invoiceId, contractId, clientId, clientName,
        amount, currency, paymentDate, paymentMethod, transactionRef,
        depositingBank, receiptDocId, notes, recordedBy, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.paymentNumber, data.invoiceId || null, data.contractId || null,
      data.clientId, data.clientName, data.amount, data.currency || 'USD',
      data.paymentDate, data.paymentMethod, data.transactionRef || '',
      data.depositingBank || '', data.receiptDocId || null, data.notes || '',
      data.recordedBy || 'System', now
    );

    // Auto-update invoice paid amount if linked
    if (data.invoiceId) {
      const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(data.invoiceId) as any;
      if (inv) {
        const newPaid = (inv.paidAmount || 0) + Number(data.amount);
        const newStatus = newPaid >= inv.grandTotal ? 'paid' : (newPaid > 0 ? 'partially_paid' : inv.status);
        db.prepare('UPDATE invoices SET paidAmount = ?, status = ?, updatedAt = ? WHERE id = ?')
          .run(newPaid, newStatus, now, data.invoiceId);
      }
    }

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/payments/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. EXPENSES LEDGER (4/10)
// ==========================================
apiRouter.get('/expenses', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all() as any[];
    const expenses = rows.map(e => ({
      ...e,
      taxDeductible: Boolean(e.taxDeductible)
    }));
    res.json(expenses);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/expenses', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `exp-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO expenses (
        id, expenseNumber, title, category, vendor, amount, currency,
        date, paidBy, reimbursementStatus, taxDeductible, receiptAttachmentName,
        notes, recordedBy, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.expenseNumber, data.title, data.category, data.vendor,
      data.amount, data.currency || 'USD', data.date, data.paidBy,
      data.reimbursementStatus || 'not_applicable', data.taxDeductible ? 1 : 0,
      data.receiptAttachmentName || null, data.notes || '',
      data.recordedBy || 'System', now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/expenses/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. CAPITAL CONTRIBUTIONS & EQUITY (5/10 & 6/10)
// ==========================================
apiRouter.get('/capital-contributions', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM capital_contributions ORDER BY date DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/capital-contributions', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `cap-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO capital_contributions (
        id, partnerName, partnerId, amount, currency, date,
        contributionType, transactionRef, bankAccount, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.partnerName, data.partnerId, data.amount, data.currency || 'USD',
      data.date, data.contributionType, data.transactionRef || '',
      data.bankAccount || '', data.notes || '', now
    );

    // Update partner equity table
    const eq = db.prepare('SELECT * FROM partner_equity WHERE partnerId = ?').get(data.partnerId) as any;
    if (eq) {
      const newTotal = eq.totalContributed + Number(data.amount);
      const newNet = newTotal - eq.totalDrawings;
      db.prepare('UPDATE partner_equity SET totalContributed = ?, netCapitalBalance = ?, lastUpdated = ? WHERE partnerId = ?')
        .run(newTotal, newNet, now, data.partnerId);
    }

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/equity', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM partner_equity ORDER BY ownershipPercentage DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/equity/:partnerId', (req, res) => {
  try {
    const { partnerId } = req.params;
    const data = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE partner_equity SET
        designation = ?, ownershipPercentage = ?, profitSharePercentage = ?,
        signatureImage = ?, lastUpdated = ?
      WHERE partnerId = ?
    `).run(
      data.designation, data.ownershipPercentage, data.profitSharePercentage,
      data.signatureImage || null, now, partnerId
    );

    res.json({ success: true, partnerId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. IP / CODE OWNERSHIP (7/10)
// ==========================================
apiRouter.get('/ip-registry', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM ip_ownership ORDER BY registrationDate DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/ip-registry', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `ip-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO ip_ownership (
        id, title, repositoryUrl, commitHashOrVersion, ownershipType,
        clientAssignmentId, clientName, primaryAuthorPartner,
        registrationDate, legalStatus, licenseTerms, summary, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.title, data.repositoryUrl || null, data.commitHashOrVersion || null,
      data.ownershipType, data.clientAssignmentId || null, data.clientName || null,
      data.primaryAuthorPartner, data.registrationDate, data.legalStatus,
      data.licenseTerms || '', data.summary || '', now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/ip-registry/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    db.prepare(`
      UPDATE ip_ownership SET
        title = ?, repositoryUrl = ?, commitHashOrVersion = ?, ownershipType = ?,
        clientAssignmentId = ?, clientName = ?, primaryAuthorPartner = ?,
        legalStatus = ?, licenseTerms = ?, summary = ?
      WHERE id = ?
    `).run(
      data.title, data.repositoryUrl || null, data.commitHashOrVersion || null,
      data.ownershipType, data.clientAssignmentId || null, data.clientName || null,
      data.primaryAuthorPartner, data.legalStatus, data.licenseTerms || '',
      data.summary || '', id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/ip-registry/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM ip_ownership WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. ASSETS LEDGER (8/10)
// ==========================================
apiRouter.get('/assets', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM assets ORDER BY purchaseDate DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/assets', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `ast-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO assets (
        id, assetNumber, name, category, purchaseDate, purchaseCost,
        currentBookValue, depreciationRatePercent, assignedTo,
        serialNumberOrKey, condition, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.assetNumber, data.name, data.category, data.purchaseDate,
      data.purchaseCost, data.currentBookValue, data.depreciationRatePercent || 15,
      data.assignedTo || 'Unassigned', data.serialNumberOrKey || null,
      data.condition || 'active_excellent', data.notes || '', now, now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/assets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE assets SET
        name = ?, category = ?, purchaseCost = ?, currentBookValue = ?,
        depreciationRatePercent = ?, assignedTo = ?, condition = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      data.name, data.category, data.purchaseCost, data.currentBookValue,
      data.depreciationRatePercent || 15, data.assignedTo || 'Unassigned',
      data.condition, data.notes || '', now, id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/assets/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 12. DEBTS & LIABILITIES LEDGER (9/10)
// ==========================================
apiRouter.get('/debts', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM debts ORDER BY startDate DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/debts', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `dbt-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO debts (
        id, debtNumber, creditor, debtType, principalAmount, currentBalance,
        interestRatePercent, repaymentTermMonths, monthlyPayment, startDate,
        maturityDate, status, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.debtNumber, data.creditor, data.debtType, data.principalAmount,
      data.currentBalance, data.interestRatePercent || 0, data.repaymentTermMonths || 12,
      data.monthlyPayment || 0, data.startDate || now.split('T')[0],
      data.maturityDate || null, data.status || 'active', data.notes || '', now, now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/debts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE debts SET
        creditor = ?, debtType = ?, principalAmount = ?, currentBalance = ?,
        interestRatePercent = ?, monthlyPayment = ?, status = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      data.creditor, data.debtType, data.principalAmount, data.currentBalance,
      data.interestRatePercent || 0, data.monthlyPayment || 0,
      data.status || 'active', data.notes || '', now, id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/debts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM debts WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 13. TAX FILINGS LEDGER (10/10)
// ==========================================
apiRouter.get('/tax-filings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM tax_filings ORDER BY dueDate DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tax-filings', (req, res) => {
  try {
    const data = req.body;
    const id = data.id || `tax-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tax_filings (
        id, filingNumber, taxType, title, fiscalYear, periodOrQuarter,
        dueDate, filingDate, ackNumberOrArn, taxLiabilityAmount, taxPaidAmount,
        status, signedByPartner, auditorNotes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.filingNumber, data.taxType, data.title, data.fiscalYear,
      data.periodOrQuarter, data.dueDate, data.filingDate || null,
      data.ackNumberOrArn || null, data.taxLiabilityAmount || 0,
      data.taxPaidAmount || 0, data.status || 'draft', data.signedByPartner,
      data.auditorNotes || '', now, now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/tax-filings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tax_filings SET
        taxType = ?, title = ?, fiscalYear = ?, periodOrQuarter = ?,
        dueDate = ?, filingDate = ?, ackNumberOrArn = ?, taxLiabilityAmount = ?,
        taxPaidAmount = ?, status = ?, signedByPartner = ?, auditorNotes = ?, updatedAt = ?
      WHERE id = ?
    `).run(
      data.taxType, data.title, data.fiscalYear, data.periodOrQuarter,
      data.dueDate, data.filingDate || null, data.ackNumberOrArn || null,
      data.taxLiabilityAmount || 0, data.taxPaidAmount || 0, data.status,
      data.signedByPartner, data.auditorNotes || '', now, id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/tax-filings/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM tax_filings WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 14. DOCUMENTS & TASKS
// ==========================================
apiRouter.get('/documents', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM documents ORDER BY updatedAt DESC').all() as any[];
    const docs = rows.map(d => ({
      ...d,
      payload: parseJson(d.payload, {}),
      agencySnapshot: parseJson(d.agencySnapshot, {}),
      sharedWithClient: Boolean(d.sharedWithClient)
    }));
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/documents', (req, res) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();
    const id = data.id || `doc-${Date.now().toString(36)}`;

    db.prepare(`
      INSERT OR REPLACE INTO documents (
        id, type, title, docNumber, createdAt, updatedAt, clientName,
        clientId, status, payload, agencySnapshot, sharedWithClient, sharedAt, clientNotes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.type, data.title, data.docNumber, data.createdAt || now, now,
      data.clientName || null, data.clientId || null, data.status || 'draft',
      JSON.stringify(data.payload || {}), JSON.stringify(data.agencySnapshot || {}),
      data.sharedWithClient ? 1 : 0, data.sharedAt || null, data.clientNotes || null
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.delete('/documents/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.get('/tasks', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM tasks ORDER BY createdAt DESC').all();
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.post('/tasks', (req, res) => {
  try {
    const data = req.body;
    const now = new Date().toISOString();
    const id = data.id || `tsk-${Date.now().toString(36)}`;

    db.prepare(`
      INSERT INTO tasks (
        id, title, description, freelancerId, freelancerName, projectName,
        clientName, priority, status, dueDate, estimatedHours, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.title, data.description || '', data.freelancerId,
      data.freelancerName || '', data.projectName || '', data.clientName || '',
      data.priority || 'medium', data.status || 'todo', data.dueDate || '',
      data.estimatedHours || 0, now
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

apiRouter.put('/tasks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    db.prepare(`
      UPDATE tasks SET
        status = ?, deliverableUrl = ?, deliverableNotes = ?, submittedAt = ?
      WHERE id = ?
    `).run(
      data.status, data.deliverableUrl || null, data.deliverableNotes || null,
      data.submittedAt || null, id
    );

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

