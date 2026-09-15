import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileText
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { 
  TaxFilingRecord, 
  TaxType, 
  TaxFilingStatus 
} from '../../types/partnership';
import { CurrencyToggle } from '../common/CurrencyToggle';

export const TaxFilingsView: React.FC = () => {
  const { 
    taxFilings, 
    addNewTaxFiling, 
    updateTaxFilingItem, 
    removeTaxFilingItem, 
    currentUser,
    activeCurrency,
    setActiveCurrency,
    formatMoney
  } = useAgency();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiling, setSelectedFiling] = useState<TaxFilingRecord | null>(null);

  const [form, setForm] = useState<Partial<TaxFilingRecord>>({
    filingNumber: `TAX-${new Date().getFullYear()}-${String(taxFilings.length + 1).padStart(3, '0')}`,
    taxType: 'gst_vat_return',
    title: 'GSTR-3B Monthly Return & Input Tax Credit Reconciliation',
    fiscalYear: 'FY 2025-26',
    periodOrQuarter: 'Q2 (Jul - Sep 2025)',
    dueDate: new Date().toISOString().split('T')[0],
    filingDate: '',
    ackNumberOrArn: '',
    taxLiabilityAmount: 4800,
    taxPaidAmount: 4800,
    status: 'filed',
    signedByPartner: 'Subhadip Jana',
    auditorNotes: 'Reconciled against bank wire receipts and contractor TDS.'
  });

  const canManageTaxes = currentUser?.roleLevel !== undefined ? currentUser.roleLevel >= 80 : true;

  const totalLiability = taxFilings.reduce((sum, t) => sum + t.taxLiabilityAmount, 0);
  const totalPaid = taxFilings.reduce((sum, t) => sum + t.taxPaidAmount, 0);
  const filedCount = taxFilings.filter(t => t.status === 'filed' || t.status === 'verified').length;

  const filteredFilings = taxFilings.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.filingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.ackNumberOrArn && t.ackNumberOrArn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || t.taxType === filterType;
    return matchesSearch && matchesType;
  });

  const handleOpenNew = () => {
    setForm({
      filingNumber: `TAX-${new Date().getFullYear()}-${String(taxFilings.length + 1).padStart(3, '0')}`,
      taxType: 'gst_vat_return',
      title: 'GSTR-1 Outward Supplies Monthly Return',
      fiscalYear: 'FY 2025-26',
      periodOrQuarter: 'September 2025',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      filingDate: '',
      ackNumberOrArn: '',
      taxLiabilityAmount: 3200,
      taxPaidAmount: 0,
      status: 'draft',
      signedByPartner: 'Subhadip Jana',
      auditorNotes: 'Draft invoices compiled for external tax auditor review.'
    });
    setSelectedFiling(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiling) {
      await updateTaxFilingItem(selectedFiling.id, form);
    } else {
      await addNewTaxFiling(form);
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: TaxFilingStatus) => {
    switch (status) {
      case 'verified':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><ShieldCheck className="w-3 h-3" /> Verified by Auditor</span>;
      case 'filed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200"><CheckCircle2 className="w-3 h-3" /> Filed (ARN Issued)</span>;
      case 'pending_audit':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3 h-3" /> Under CA Audit</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200"><Clock className="w-3 h-3" /> In Preparation</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-ink-950">Statutory Tax & Compliance Ledger</h1>
            <span className="text-xs bg-clay-100 text-clay-800 font-semibold px-2 py-0.5 rounded-full">
              Ledger 10 of 10
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Reconcile GST Returns, Partnership Income Tax (ITR-5), Advance Tax, and TDS Acknowledgements.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <CurrencyToggle 
            value={activeCurrency} 
            onChange={setActiveCurrency} 
            size="sm" 
            showRateNotice={true} 
          />

          {canManageTaxes && (
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-clay-600 hover:bg-clay-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Record Tax Filing
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Total Assessed Tax</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-950 mt-2">
            {formatMoney(totalLiability)}
          </div>
          <div className="text-xs text-ink-500 mt-1">Across all fiscal quarters & returns</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Statutory Tax Remitted</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-700 mt-2">
            {formatMoney(totalPaid)}
          </div>
          <div className="text-xs text-ink-500 mt-1">Direct government treasury challans paid</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Filing Compliance</span>
            <div className="p-2 rounded-lg bg-clay-50 text-clay-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-clay-800 mt-2">
            {filedCount} <span className="text-sm font-normal text-ink-400">/ {taxFilings.length} completed</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">Fully compliant with zero penalties</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-parchment-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search tax return title, filing #, or ARN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-medium text-ink-700 w-full sm:w-auto"
        >
          <option value="all">All Filing Types</option>
          <option value="gst_vat_return">GST / VAT Returns</option>
          <option value="partnership_income_tax">Partnership Income Tax (ITR-5)</option>
          <option value="advance_tax_q1_q4">Advance Tax Installments</option>
          <option value="tds_withholding">TDS Withholding Returns</option>
          <option value="annual_audit">Statutory Audit</option>
        </select>
      </div>

      {/* Tax Filings Table */}
      <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                <th className="py-3 px-4">Filing # & Return Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Fiscal Period</th>
                <th className="py-3 px-4">Due / Filed Date</th>
                <th className="py-3 px-4">ARN / Ack Number</th>
                <th className="py-3 px-4">Liability / Paid</th>
                <th className="py-3 px-4">Signer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100 text-sm">
              {filteredFilings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-ink-400 text-xs">No tax filings found.</td>
                </tr>
              ) : (
                filteredFilings.map((tf) => (
                  <tr key={tf.id} className="hover:bg-parchment-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-ink-900">{tf.title}</div>
                      <div className="text-xs text-ink-400 font-mono">{tf.filingNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-parchment-100 text-ink-700 capitalize">
                        {tf.taxType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-semibold text-ink-800">{tf.fiscalYear}</div>
                      <div className="text-ink-500">{tf.periodOrQuarter}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-600">
                      <div>Due: {tf.dueDate}</div>
                      {tf.filingDate && <div className="text-emerald-700 font-medium">Filed: {tf.filingDate}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-ink-800 font-medium">
                      {tf.ackNumberOrArn ? (
                        <span className="px-2 py-0.5 rounded bg-parchment-100 text-ink-800">
                          {tf.ackNumberOrArn}
                        </span>
                      ) : (
                        <span className="text-ink-400 italic">Pending Filing</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <div className="text-ink-600">{formatMoney(tf.taxLiabilityAmount)}</div>
                      <div className="font-bold text-emerald-700">Paid: {formatMoney(tf.taxPaidAmount)}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-clay-700">
                      {tf.signedByPartner}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(tf.status)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canManageTaxes && (
                        <button
                          onClick={() => {
                            setSelectedFiling(tf);
                            setForm(tf);
                            setIsModalOpen(true);
                          }}
                          className="text-xs text-clay-600 hover:text-clay-800 font-semibold"
                        >
                          Edit
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

      {/* Tax Filing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">
              {selectedFiling ? `Edit Tax Filing: ${selectedFiling.filingNumber}` : 'Record Statutory Tax Filing'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Filing Number</label>
                  <input
                    type="text"
                    required
                    value={form.filingNumber || ''}
                    onChange={(e) => setForm({ ...form, filingNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Tax Type</label>
                  <select
                    value={form.taxType}
                    onChange={(e) => setForm({ ...form, taxType: e.target.value as TaxType })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="gst_vat_return">GST / VAT Return</option>
                    <option value="partnership_income_tax">Partnership Income Tax (ITR-5)</option>
                    <option value="advance_tax_q1_q4">Advance Tax Q1-Q4</option>
                    <option value="tds_withholding">TDS Withholding Return</option>
                    <option value="annual_audit">Statutory CA Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Return Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GSTR-3B Monthly Return"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Fiscal Year</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FY 2025-26"
                    value={form.fiscalYear || ''}
                    onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Period / Quarter</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q2 (Jul - Sep)"
                    value={form.periodOrQuarter || ''}
                    onChange={(e) => setForm({ ...form, periodOrQuarter: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Due Date</label>
                  <input
                    type="date"
                    required
                    value={form.dueDate || ''}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Actual Filing Date</label>
                  <input
                    type="date"
                    value={form.filingDate || ''}
                    onChange={(e) => setForm({ ...form, filingDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Tax Liability ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    required
                    value={form.taxLiabilityAmount || 0}
                    onChange={(e) => setForm({ ...form, taxLiabilityAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Tax Paid ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    required
                    value={form.taxPaidAmount || 0}
                    onChange={(e) => setForm({ ...form, taxPaidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Acknowledgement ARN / UTR</label>
                  <input
                    type="text"
                    placeholder="e.g. ARN-AA190826..."
                    value={form.ackNumberOrArn || ''}
                    onChange={(e) => setForm({ ...form, ackNumberOrArn: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Signed Partner</label>
                  <select
                    value={form.signedByPartner}
                    onChange={(e) => setForm({ ...form, signedByPartner: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="Subhadip Jana">Subhadip Jana</option>
                    <option value="Shayan Das">Shayan Das</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as TaxFilingStatus })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                >
                  <option value="draft">In Preparation / Draft</option>
                  <option value="pending_audit">Under CA External Audit</option>
                  <option value="filed">Filed (Govt. Receipt Generated)</option>
                  <option value="verified">Verified & Assessed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Auditor Notes & Observations</label>
                <textarea
                  rows={2}
                  value={form.auditorNotes || ''}
                  onChange={(e) => setForm({ ...form, auditorNotes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-parchment-200">
                {selectedFiling && canManageTaxes ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Delete filing ${selectedFiling.filingNumber}?`)) {
                        await removeTaxFilingItem(selectedFiling.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Delete Filing
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-ink-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Save Filing
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
