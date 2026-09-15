import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  UserCheck
} from 'lucide-react';

import { useAgency } from '../../context/AgencyContext';
import { ClientContractRecord, ContractType, ContractStatus } from '../../types/partnership';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { convertAmount, CurrencyCode } from '../../services/currency';

export const ContractsLedger: React.FC = () => {
  const { 
    contracts, 
    addNewContract, 
    updateContractItem, 
    removeContractItem, 
    clients, 
    currentUser,
    activeCurrency,
    setActiveCurrency,
    formatMoney 
  } = useAgency();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPartner, setFilterPartner] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ClientContractRecord | null>(null);

  // Form state for creating / editing contract
  const [formData, setFormData] = useState<Partial<ClientContractRecord>>({
    contractNumber: `CT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
    title: '',
    clientId: '',
    clientName: '',
    type: 'sow',
    contractValue: 10000,
    currency: 'USD',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    partnerInCharge: 'Subhadip Jana',
    status: 'draft',
    termsSummary: 'Standard net-30 billing upon deliverable milestone approval.',
    ipOwnershipClause: 'Full IP assignment upon receipt of 100% final invoice payment.'
  });

  const canManageContracts = currentUser?.roleLevel !== undefined ? currentUser.roleLevel >= 60 : true;

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesPartner = filterPartner === 'all' || c.partnerInCharge === filterPartner;
    return matchesSearch && matchesStatus && matchesPartner;
  });

  const totalContractValue = contracts.reduce((acc, c) => acc + (c.status !== 'terminated' ? c.contractValue : 0), 0);
  const activeContractsCount = contracts.filter(c => c.status === 'active').length;

  const handleOpenNew = () => {
    setFormData({
      contractNumber: `CT-${new Date().getFullYear()}-${String(contracts.length + 1).padStart(3, '0')}`,
      title: '',
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.companyName || '',
      type: 'sow',
      contractValue: 15000,
      currency: 'USD',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      partnerInCharge: 'Subhadip Jana',
      status: 'draft',
      termsSummary: 'Milestone delivery with bi-weekly sprint reviews and net-15 payment terms.',
      ipOwnershipClause: 'Custom client deliverables assigned upon settlement. Proprietary agency toolkits retained by Jana & Das.'
    });
    setSelectedContract(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContract) {
      await updateContractItem(selectedContract.id, formData);
    } else {
      await addNewContract(formData);
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Active</span>;
      case 'pending_signature':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Pending Signature</span>;
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"><Clock className="w-3 h-3" /> Draft</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"><CheckCircle2 className="w-3 h-3" /> Completed</span>;
      case 'terminated':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200"><AlertCircle className="w-3 h-3" /> Terminated</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-ink-950">Client Contracts Ledger</h1>
            <span className="text-xs bg-clay-100 text-clay-800 font-semibold px-2 py-0.5 rounded-full">
              Ledger 1 of 10
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Complete legal registry of every Master Service Agreement, Statement of Work, and Retainer.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <CurrencyToggle 
            value={activeCurrency} 
            onChange={setActiveCurrency} 
            size="sm" 
            showRateNotice={true} 
          />

          {canManageContracts && (
            <button
              onClick={handleOpenNew}
              className="inline-flex items-center gap-2 px-4 py-2 bg-clay-600 hover:bg-clay-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Record New Contract
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Total Contract Bookings</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-950 mt-2">
            {formatMoney(totalContractValue)}
          </div>
          <div className="text-xs text-ink-500 mt-1">Across all registered client agreements</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Active Contracts</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-ink-950 mt-2">
            {activeContractsCount} <span className="text-sm font-normal text-ink-400">/ {contracts.length} total</span>
          </div>
          <div className="text-xs text-ink-500 mt-1">Currently in active engineering delivery</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Partner Oversight</span>
            <div className="p-2 rounded-lg bg-clay-50 text-clay-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-medium text-ink-800 mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subhadip Jana:</span>
              <span className="font-semibold">{contracts.filter(c => c.partnerInCharge === 'Subhadip Jana').length} contracts</span>
            </div>
            <div className="flex justify-between">
              <span>Shayan Das:</span>
              <span className="font-semibold">{contracts.filter(c => c.partnerInCharge === 'Shayan Das').length} contracts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-parchment-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search by title, client, or contract #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-clay-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-medium text-ink-700"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending_signature">Pending Signature</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
          </select>

          <select
            value={filterPartner}
            onChange={(e) => setFilterPartner(e.target.value)}
            className="px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-medium text-ink-700"
          >
            <option value="all">All Partners</option>
            <option value="Subhadip Jana">Partner: Subhadip Jana</option>
            <option value="Shayan Das">Partner: Shayan Das</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Contract # & Title</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Value</th>
                <th className="py-3.5 px-4">Term Dates</th>
                <th className="py-3.5 px-4">Partner In Charge</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100 text-sm">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-ink-400">
                    No contracts match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-parchment-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-ink-900">{c.title}</div>
                      <div className="text-xs text-ink-400 font-mono">{c.contractNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink-800">
                      {c.clientName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase text-xs font-semibold px-2 py-0.5 rounded bg-parchment-100 text-ink-700">
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-ink-900">
                      {formatMoney(c.contractValue, c.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-ink-600">
                      <div>{c.startDate} to</div>
                      <div className="font-medium text-ink-800">{c.endDate}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-clay-700 bg-clay-50 px-2 py-0.5 rounded-full border border-clay-100">
                        <UserCheck className="w-3 h-3" />
                        {c.partnerInCharge}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedContract(c);
                          setFormData(c);
                          setIsModalOpen(true);
                        }}
                        className="text-xs text-clay-600 hover:text-clay-800 font-semibold px-2 py-1 rounded hover:bg-clay-50 transition"
                      >
                        Inspect / Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between border-b border-parchment-200 pb-4 mb-5">
              <div>
                <h2 className="text-lg font-serif font-bold text-ink-950">
                  {selectedContract ? `Edit Contract: ${selectedContract.contractNumber}` : 'Record New Client Contract'}
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">
                  Full partnership legal audit record with IP ownership and milestone terms.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-400 hover:text-ink-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Contract Number</label>
                  <input
                    type="text"
                    required
                    value={formData.contractNumber || ''}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Contract Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  >
                    <option value="sow">Statement of Work (SOW)</option>
                    <option value="msa">Master Services Agreement (MSA)</option>
                    <option value="retainer">Dedicated Monthly Retainer</option>
                    <option value="fixed_price">Fixed-Price Project</option>
                    <option value="nda">Non-Disclosure Agreement (NDA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Contract Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Core Telemetry Infrastructure Engineering"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName || ''}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Partner In Charge</label>
                  <select
                    value={formData.partnerInCharge}
                    onChange={(e) => setFormData({ ...formData, partnerInCharge: e.target.value as any })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  >
                    <option value="Subhadip Jana">Subhadip Jana (Technical Partner)</option>
                    <option value="Shayan Das">Shayan Das (Commercial Partner)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-ink-700 uppercase">
                      Value ({formData.currency === 'INR' ? '₹' : '$'})
                    </label>
                    <CurrencyToggle
                      value={formData.currency || activeCurrency}
                      onChange={(curr) => {
                        const prevCurr = (formData.currency || activeCurrency) as CurrencyCode;
                        const converted = convertAmount(formData.contractValue || 0, prevCurr, curr);
                        setFormData({ ...formData, currency: curr, contractValue: converted });
                      }}
                      size="sm"
                    />
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.contractValue || 0}
                    onChange={(e) => setFormData({ ...formData, contractValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContractStatus })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending_signature">Pending Signature</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Signed Date (if executed)</label>
                  <input
                    type="date"
                    value={formData.signedDate || ''}
                    onChange={(e) => setFormData({ ...formData, signedDate: e.target.value })}
                    className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">IP Ownership Clause</label>
                <textarea
                  rows={2}
                  value={formData.ipOwnershipClause || ''}
                  onChange={(e) => setFormData({ ...formData, ipOwnershipClause: e.target.value })}
                  placeholder="Specify client code ownership transfer conditions and agency retained IP..."
                  className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 uppercase mb-1">Payment & Milestone Terms</label>
                <textarea
                  rows={2}
                  value={formData.termsSummary || ''}
                  onChange={(e) => setFormData({ ...formData, termsSummary: e.target.value })}
                  placeholder="Payment milestones, sprint approval cadence, late fees..."
                  className="w-full px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-parchment-200">
                {selectedContract && canManageContracts ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete contract ${selectedContract.contractNumber}?`)) {
                        await removeContractItem(selectedContract.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Delete Contract
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm text-ink-600 hover:text-ink-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-clay-600 hover:bg-clay-700 text-white text-sm font-semibold rounded-lg shadow-sm"
                  >
                    Save Contract
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
