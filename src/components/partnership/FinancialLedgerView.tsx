import React, { useState } from 'react';
import { 
  Receipt, 
  CreditCard, 
  TrendingDown, 
  TrendingUp, 
  Plus, 
  Search, 
  FileCheck
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { 
  InvoiceRecord, 
  PaymentRecord, 
  ExpenseRecord, 
  InvoiceStatus, 
  PaymentMethod, 
  ExpenseCategory, 
  PaidBySource 
} from '../../types/partnership';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { convertAmount, CurrencyCode } from '../../services/currency';

export const FinancialLedgerView: React.FC = () => {
  const { 
    invoices, 
    payments, 
    expenses, 
    addNewInvoice, 
    removeInvoiceItem, 
    addNewPayment, 
    removePaymentItem, 
    addNewExpense, 
    removeExpenseItem,
    currentUser,
    activeCurrency,
    setActiveCurrency,
    formatMoney
  } = useAgency();

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'expenses'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState<Partial<InvoiceRecord>>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
    clientId: '',
    clientName: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    subtotal: 12000,
    taxPercent: 18,
    taxAmount: 2160,
    discountAmount: 0,
    grandTotal: 14160,
    paidAmount: 0,
    status: 'sent',
    paymentTerms: 'Net 15 Days wire transfer',
    notes: 'Phase 1 development milestone deliverable.'
  });

  const [paymentForm, setPaymentForm] = useState<Partial<PaymentRecord>>({
    paymentNumber: `PAY-${new Date().getFullYear()}-${String(payments.length + 1).padStart(3, '0')}`,
    invoiceId: '',
    clientId: '',
    clientName: '',
    amount: 10000,
    currency: 'USD',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'wire_transfer',
    transactionRef: 'WIRE-HDFC-994821',
    depositingBank: 'HDFC Commercial Banking (A/C ...0194)',
    notes: 'Received in full for milestone sprint invoice.'
  });

  const [expenseForm, setExpenseForm] = useState<Partial<ExpenseRecord>>({
    expenseNumber: `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(3, '0')}`,
    title: '',
    category: 'cloud_hosting',
    vendor: '',
    amount: 450,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    paidBy: 'firm_account',
    reimbursementStatus: 'not_applicable',
    taxDeductible: true,
    notes: 'Monthly infrastructure and engineering tools.'
  });

  const canManageFinance = currentUser?.roleLevel !== undefined ? currentUser.roleLevel >= 60 : true;

  // KPI calculations
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalPaidInvoices = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPaymentsReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netSurplus = totalPaymentsReceived - totalExpenses;

  // Filtered arrays
  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayments = payments.filter(p => 
    p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transactionRef.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewInvoice(invoiceForm);
    setInvoiceModalOpen(false);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewPayment(paymentForm);
    setPaymentModalOpen(false);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewExpense(expenseForm);
    setExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-ink-950">Financial Operations Ledgers</h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Ledgers 2, 3 & 4 of 10
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Reconcile Every Invoice Billed, Every Client Payment Received, and Every Firm Operating Expense.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <CurrencyToggle 
            value={activeCurrency} 
            onChange={setActiveCurrency} 
            size="sm" 
            showRateNotice={true} 
          />

          {canManageFinance && (
            <div className="flex items-center gap-2">
              {activeTab === 'invoices' && (
                <button
                  onClick={() => setInvoiceModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Invoice
                </button>
              )}
              {activeTab === 'payments' && (
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Payment Received
                </button>
              )}
              {activeTab === 'expenses' && (
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Expense
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold font-serif text-ink-950 mt-1">
            {formatMoney(totalInvoiced)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">
            {formatMoney(totalInvoiced - totalPaidInvoices)} outstanding
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Payments Collected</span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-serif text-emerald-700 mt-1">
            {formatMoney(totalPaymentsReceived)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">
            {payments.length} verified transactions
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Total Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold font-serif text-rose-700 mt-1">
            {formatMoney(totalExpenses)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">
            Operating costs & payroll
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Net Operating Cashflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className={`text-xl font-bold font-serif mt-1 ${netSurplus >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatMoney(netSurplus)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">
            Cash collected minus expenses
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-parchment-200 p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-parchment-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === 'invoices'
                ? 'bg-white text-clay-700 shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Invoices Ledger ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === 'payments'
                ? 'bg-white text-clay-700 shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Payments Collected ({payments.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === 'expenses'
                ? 'bg-white text-clay-700 shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Expenses ({expenses.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64 px-2">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Tab 1: Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Issue / Due Date</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax / GST</th>
                  <th className="py-3 px-4">Grand Total</th>
                  <th className="py-3 px-4">Paid Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100 text-sm">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-ink-400 text-xs">No invoices found.</td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-parchment-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-ink-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-medium text-ink-800">{inv.clientName}</td>
                      <td className="py-3 px-4 text-xs text-ink-600">
                        <div>{inv.issueDate}</div>
                        <div className="text-ink-400">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">{formatMoney(inv.subtotal)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-500">{formatMoney(inv.taxAmount)} ({inv.taxPercent}%)</td>
                      <td className="py-3 px-4 font-mono font-bold text-ink-950">{formatMoney(inv.grandTotal)}</td>
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-700">{formatMoney(inv.paidAmount)}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'partially_paid' ? 'bg-amber-100 text-amber-800' :
                          inv.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManageFinance && (
                          <button
                            onClick={async () => {
                              if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) {
                                await removeInvoiceItem(inv.id);
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Payments Collected Table */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                  <th className="py-3 px-4">Payment #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Tx Reference / UTR</th>
                  <th className="py-3 px-4">Depositing Bank</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100 text-sm">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-ink-400 text-xs">No payments found.</td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-parchment-50/50">
                      <td className="py-3 px-4 font-mono font-semibold text-emerald-800">{p.paymentNumber}</td>
                      <td className="py-3 px-4 font-medium text-ink-900">{p.clientName}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-base">
                        +{formatMoney(p.amount, p.currency)}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-600">{p.paymentDate}</td>
                      <td className="py-3 px-4">
                        <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {p.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-700">{p.transactionRef}</td>
                      <td className="py-3 px-4 text-xs text-ink-600">{p.depositingBank}</td>
                      <td className="py-3 px-4 text-right">
                        {canManageFinance && (
                          <button
                            onClick={async () => {
                              if (confirm(`Remove payment ${p.paymentNumber}?`)) {
                                await removePaymentItem(p.id);
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Operating Expenses Table */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                  <th className="py-3 px-4">Expense # & Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Paid By</th>
                  <th className="py-3 px-4">Tax Deductible</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100 text-sm">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-ink-400 text-xs">No expenses found.</td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-parchment-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink-900">{exp.title}</div>
                        <div className="text-xs text-ink-400 font-mono">{exp.expenseNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-parchment-100 text-ink-700 capitalize">
                          {exp.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-ink-800">{exp.vendor}</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-700">
                        -{formatMoney(exp.amount, exp.currency)}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-600">{exp.date}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          exp.paidBy === 'firm_account' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {exp.paidBy}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {exp.taxDeductible ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" /> 100% Deductible
                          </span>
                        ) : (
                          <span className="text-ink-400">Non-deductible</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManageFinance && (
                          <button
                            onClick={async () => {
                              if (confirm(`Remove expense ${exp.expenseNumber}?`)) {
                                await removeExpenseItem(exp.id);
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">Record Client Invoice</h2>
            <form onSubmit={handleSaveInvoice} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.invoiceNumber || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Client Name</label>
                  <input
                    type="text"
                    required
                    value={invoiceForm.clientName || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Subtotal ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.subtotal || 0}
                    onChange={(e) => {
                      const sub = Number(e.target.value);
                      const tax = sub * ((invoiceForm.taxPercent || 18) / 100);
                      setInvoiceForm({ ...invoiceForm, subtotal: sub, taxAmount: tax, grandTotal: sub + tax });
                    }}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Tax / GST %</label>
                  <input
                    type="number"
                    value={invoiceForm.taxPercent || 0}
                    onChange={(e) => {
                      const pct = Number(e.target.value);
                      const sub = invoiceForm.subtotal || 0;
                      const tax = sub * (pct / 100);
                      setInvoiceForm({ ...invoiceForm, taxPercent: pct, taxAmount: tax, grandTotal: sub + tax });
                    }}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Grand Total ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    readOnly
                    value={invoiceForm.grandTotal || 0}
                    className="w-full px-3 py-1.5 bg-parchment-100 border border-parchment-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.issueDate || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Status</label>
                <select
                  value={invoiceForm.status}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as InvoiceStatus })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent to Client</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Fully Paid</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg"
                >
                  Save Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">Log Client Payment Received</h2>
            <form onSubmit={handleSavePayment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Payment #</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.paymentNumber || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Client Name</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.clientName || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, clientName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-ink-700">Amount ({paymentForm.currency === 'INR' ? '₹' : '$'})</label>
                    <CurrencyToggle
                      value={paymentForm.currency || activeCurrency}
                      onChange={(curr) => {
                        const prevCurr = (paymentForm.currency || activeCurrency) as CurrencyCode;
                        const converted = convertAmount(paymentForm.amount || 0, prevCurr, curr);
                        setPaymentForm({ ...paymentForm, currency: curr, amount: converted });
                      }}
                      size="sm"
                    />
                  </div>
                  <input
                    type="number"
                    required
                    value={paymentForm.amount || 0}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700 mb-1 block">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentForm.paymentDate || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="wire_transfer">Wire / Swift</option>
                    <option value="ach">ACH Transfer</option>
                    <option value="upi">UPI / IMPS</option>
                    <option value="stripe">Stripe / Card</option>
                    <option value="bank_deposit">Bank Direct Deposit</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Transaction Reference / UTR</label>
                  <input
                    type="text"
                    required
                    value={paymentForm.transactionRef || ''}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Depositing Bank Account</label>
                <input
                  type="text"
                  value={paymentForm.depositingBank || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, depositingBank: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">Record Firm Expense</h2>
            <form onSubmit={handleSaveExpense} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Production Fleet Hosting"
                  value={expenseForm.title || ''}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="cloud_hosting">Cloud Hosting & Infra</option>
                    <option value="software_saas">Software SaaS & Tools</option>
                    <option value="hardware_equipment">Hardware & Devices</option>
                    <option value="office_rent_utilities">Office & Utilities</option>
                    <option value="contractor_payout">Contractor / Payouts</option>
                    <option value="legal_compliance">Legal & Compliance</option>
                    <option value="travel_marketing">Travel & Marketing</option>
                    <option value="taxes_fees">Taxes & Bank Fees</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Vendor</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.vendor || ''}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-ink-700">Amount ({expenseForm.currency === 'INR' ? '₹' : '$'})</label>
                    <CurrencyToggle
                      value={expenseForm.currency || activeCurrency}
                      onChange={(curr) => {
                        const prevCurr = (expenseForm.currency || activeCurrency) as CurrencyCode;
                        const converted = convertAmount(expenseForm.amount || 0, prevCurr, curr);
                        setExpenseForm({ ...expenseForm, currency: curr, amount: converted });
                      }}
                      size="sm"
                    />
                  </div>
                  <input
                    type="number"
                    required
                    value={expenseForm.amount || 0}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700 mb-1 block">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date || ''}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Paid By</label>
                  <select
                    value={expenseForm.paidBy}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value as PaidBySource })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="firm_account">Firm Commercial Account</option>
                    <option value="Subhadip Jana">Subhadip Jana (Partner Personal)</option>
                    <option value="Shayan Das">Shayan Das (Partner Personal)</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink-700">
                    <input
                      type="checkbox"
                      checked={expenseForm.taxDeductible}
                      onChange={(e) => setExpenseForm({ ...expenseForm, taxDeductible: e.target.checked })}
                      className="rounded text-clay-600 focus:ring-clay-500"
                    />
                    Tax Deductible Business Expense
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
