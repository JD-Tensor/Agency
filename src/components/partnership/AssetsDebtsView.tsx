import React, { useState } from 'react';
import { 
  Laptop, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Building
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { 
  AssetRecord, 
  DebtRecord, 
  AssetCategory, 
  AssetCondition, 
  DebtType 
} from '../../types/partnership';
import { CurrencyToggle } from '../common/CurrencyToggle';

export const AssetsDebtsView: React.FC = () => {
  const { 
    assets, 
    debts, 
    addNewAsset, 
    removeAssetItem, 
    addNewDebt, 
    removeDebtItem,
    currentUser,
    activeCurrency,
    setActiveCurrency,
    formatMoney
  } = useAgency();

  const [activeTab, setActiveTab] = useState<'assets' | 'debts'>('assets');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [debtModalOpen, setDebtModalOpen] = useState(false);

  // Forms
  const [assetForm, setAssetForm] = useState<Partial<AssetRecord>>({
    assetNumber: `AST-${new Date().getFullYear()}-${String(assets.length + 1).padStart(3, '0')}`,
    name: '',
    category: 'computer_hardware',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 3500,
    currentBookValue: 3500,
    depreciationRatePercent: 15,
    assignedTo: 'Subhadip Jana',
    condition: 'active_excellent',
    notes: ''
  });

  const [debtForm, setDebtForm] = useState<Partial<DebtRecord>>({
    debtNumber: `DBT-${new Date().getFullYear()}-${String(debts.length + 1).padStart(3, '0')}`,
    creditor: 'HDFC Commercial Lending',
    debtType: 'credit_line',
    principalAmount: 25000,
    currentBalance: 12000,
    interestRatePercent: 9.5,
    repaymentTermMonths: 24,
    monthlyPayment: 1100,
    startDate: new Date().toISOString().split('T')[0],
    maturityDate: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
    status: 'active',
    notes: 'Firm commercial revolving credit line for working capital.'
  });

  const canManageAssetsDebts = currentUser?.roleLevel !== undefined ? currentUser.roleLevel >= 60 : true;

  const totalAssetPurchaseCost = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
  const totalAssetBookValue = assets.reduce((sum, a) => sum + a.currentBookValue, 0);
  const totalDebtBalance = debts.reduce((sum, d) => sum + (d.status === 'active' ? d.currentBalance : 0), 0);
  const netFixedWorth = totalAssetBookValue - totalDebtBalance;

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assetNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDebts = debts.filter(d => 
    d.creditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.debtNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewAsset(assetForm);
    setAssetModalOpen(false);
  };

  const handleSaveDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewDebt(debtForm);
    setDebtModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-ink-950">Assets & Debts Balance Sheet</h1>
            <span className="text-xs bg-clay-100 text-clay-800 font-semibold px-2 py-0.5 rounded-full">
              Ledgers 8 & 9 of 10
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Reconcile physical hardware, software capital assets, depreciation, and firm loans/liabilities.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <CurrencyToggle 
            value={activeCurrency} 
            onChange={setActiveCurrency} 
            size="sm" 
            showRateNotice={true} 
          />

          {canManageAssetsDebts && (
            <div className="flex items-center gap-2">
              {activeTab === 'assets' ? (
                <button
                  onClick={() => setAssetModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Asset
                </button>
              ) : (
                <button
                  onClick={() => setDebtModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Liability / Debt
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Asset Historical Cost</span>
            <Laptop className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold font-serif text-ink-950 mt-1">
            {formatMoney(totalAssetPurchaseCost)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">{assets.length} registered equipment units</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Current Book Value</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-serif text-emerald-700 mt-1">
            {formatMoney(totalAssetBookValue)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">Post-depreciation statutory value</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Active Debts & Liabilities</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold font-serif text-rose-700 mt-1">
            {formatMoney(totalDebtBalance)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">{debts.filter(d => d.status === 'active').length} outstanding facilities</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-ink-500 font-medium">
            <span>Net Balance Sheet Position</span>
            <Building className="w-4 h-4 text-clay-600" />
          </div>
          <div className={`text-xl font-bold font-serif mt-1 ${netFixedWorth >= 0 ? 'text-clay-800' : 'text-rose-700'}`}>
            {formatMoney(netFixedWorth)}
          </div>
          <div className="text-[11px] text-ink-400 mt-0.5">Book assets minus total debt</div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-parchment-200 p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-1 p-1 bg-parchment-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === 'assets'
                ? 'bg-white text-clay-700 shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Fixed Assets ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('debts')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === 'debts'
                ? 'bg-white text-clay-700 shadow-xs'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            Debts & Liabilities ({debts.length})
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

      {/* Tab 1: Fixed Assets Table */}
      {activeTab === 'assets' && (
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                  <th className="py-3 px-4">Asset # & Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purchase Date</th>
                  <th className="py-3 px-4">Purchase Cost</th>
                  <th className="py-3 px-4">Depreciation %</th>
                  <th className="py-3 px-4">Book Value</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100 text-sm">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-ink-400 text-xs">No assets recorded.</td>
                  </tr>
                ) : (
                  filteredAssets.map((ast) => (
                    <tr key={ast.id} className="hover:bg-parchment-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink-900">{ast.name}</div>
                        <div className="text-xs text-ink-400 font-mono">{ast.assetNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-parchment-100 text-ink-700 capitalize">
                          {ast.category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-600">{ast.purchaseDate}</td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-600">{formatMoney(ast.purchaseCost)}</td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-500">{ast.depreciationRatePercent > 0 ? `${ast.depreciationRatePercent}% / yr` : 'None'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">{formatMoney(ast.currentBookValue)}</td>
                      <td className="py-3 px-4 text-xs font-medium text-ink-800">{ast.assignedTo}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                          ast.condition === 'active_excellent' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ast.condition.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManageAssetsDebts && (
                          <button
                            onClick={async () => {
                              if (confirm(`Delete asset ${ast.name}?`)) {
                                await removeAssetItem(ast.id);
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

      {/* Tab 2: Debts & Liabilities Table */}
      {activeTab === 'debts' && (
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                  <th className="py-3 px-4">Debt # & Creditor</th>
                  <th className="py-3 px-4">Facility Type</th>
                  <th className="py-3 px-4">Principal</th>
                  <th className="py-3 px-4">Current Balance</th>
                  <th className="py-3 px-4">Interest Rate</th>
                  <th className="py-3 px-4">Monthly EMI</th>
                  <th className="py-3 px-4">Maturity Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100 text-sm">
                {filteredDebts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-ink-400 text-xs">No debts or liabilities recorded.</td>
                  </tr>
                ) : (
                  filteredDebts.map((d) => (
                    <tr key={d.id} className="hover:bg-parchment-50/50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink-900">{d.creditor}</div>
                        <div className="text-xs text-ink-400 font-mono">{d.debtNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-parchment-100 text-ink-700 capitalize">
                          {d.debtType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-600">{formatMoney(d.principalAmount)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-700 text-base">
                        {formatMoney(d.currentBalance)}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-700">{d.interestRatePercent}% p.a.</td>
                      <td className="py-3 px-4 font-mono text-xs text-ink-800">{formatMoney(d.monthlyPayment)} / mo</td>
                      <td className="py-3 px-4 text-xs text-ink-600">{d.maturityDate || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                          d.status === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManageAssetsDebts && (
                          <button
                            onClick={async () => {
                              if (confirm(`Remove debt facility ${d.debtNumber}?`)) {
                                await removeDebtItem(d.id);
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

      {/* Asset Modal */}
      {assetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">Register Equipment / Capital Asset</h2>
            <form onSubmit={handleSaveAsset} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Asset Number</label>
                  <input
                    type="text"
                    required
                    value={assetForm.assetNumber || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, assetNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Category</label>
                  <select
                    value={assetForm.category}
                    onChange={(e) => {
                      const category = e.target.value as AssetCategory;
                      // Domains and brand assets usually hold value, so default them to non-depreciating
                      const depreciationRatePercent = category === 'domain_digital' ? 0 : (assetForm.depreciationRatePercent || 15);
                      setAssetForm({ ...assetForm, category, depreciationRatePercent });
                    }}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="computer_hardware">Computer Hardware & Workstations</option>
                    <option value="software_license">Enterprise Software License</option>
                    <option value="domain_digital">Domain / Brand Asset</option>
                    <option value="office_equipment">Office Equipment</option>
                    <option value="intellectual_property">IP Asset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Asset Name / Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple MacBook Pro M3 Max 64GB"
                  value={assetForm.name || ''}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Purchase Cost ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    required
                    value={assetForm.purchaseCost || 0}
                    onChange={(e) => {
                      const cost = Number(e.target.value);
                      setAssetForm({ ...assetForm, purchaseCost: cost, currentBookValue: cost });
                    }}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Depreciation %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    disabled={(assetForm.depreciationRatePercent ?? 0) <= 0}
                    value={assetForm.depreciationRatePercent ?? 0}
                    onChange={(e) => setAssetForm({ ...assetForm, depreciationRatePercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono disabled:opacity-50"
                  />
                  <label className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-ink-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(assetForm.depreciationRatePercent ?? 0) > 0}
                      onChange={(e) => setAssetForm({ ...assetForm, depreciationRatePercent: e.target.checked ? 15 : 0 })}
                    />
                    Depreciates
                  </label>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Purchase Date</label>
                  <input
                    type="date"
                    required
                    value={assetForm.purchaseDate || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Assigned To</label>
                  <input
                    type="text"
                    value={assetForm.assignedTo || ''}
                    onChange={(e) => setAssetForm({ ...assetForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Condition</label>
                  <select
                    value={assetForm.condition}
                    onChange={(e) => setAssetForm({ ...assetForm, condition: e.target.value as AssetCondition })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="active_excellent">Active - Excellent</option>
                    <option value="active_fair">Active - Fair</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired / Written Off</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setAssetModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debt Modal */}
      {debtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">Record Firm Liability / Debt</h2>
            <form onSubmit={handleSaveDebt} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Debt Number</label>
                  <input
                    type="text"
                    required
                    value={debtForm.debtNumber || ''}
                    onChange={(e) => setDebtForm({ ...debtForm, debtNumber: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Creditor / Bank Name</label>
                  <input
                    type="text"
                    required
                    value={debtForm.creditor || ''}
                    onChange={(e) => setDebtForm({ ...debtForm, creditor: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Liability Type</label>
                  <select
                    value={debtForm.debtType}
                    onChange={(e) => setDebtForm({ ...debtForm, debtType: e.target.value as DebtType })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="bank_loan">Commercial Bank Loan</option>
                    <option value="credit_line">Revolving Credit Line</option>
                    <option value="partner_loan_to_firm">Partner Loan to Firm</option>
                    <option value="vendor_payable">Vendor Payable</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Principal Amount ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    required
                    value={debtForm.principalAmount || 0}
                    onChange={(e) => setDebtForm({ ...debtForm, principalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Current Balance ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    required
                    value={debtForm.currentBalance || 0}
                    onChange={(e) => setDebtForm({ ...debtForm, currentBalance: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono font-bold text-rose-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Interest %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={debtForm.interestRatePercent || 0}
                    onChange={(e) => setDebtForm({ ...debtForm, interestRatePercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Monthly EMI ({activeCurrency === 'INR' ? '₹' : '$'})</label>
                  <input
                    type="number"
                    value={debtForm.monthlyPayment || 0}
                    onChange={(e) => setDebtForm({ ...debtForm, monthlyPayment: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Start Date</label>
                  <input
                    type="date"
                    value={debtForm.startDate || ''}
                    onChange={(e) => setDebtForm({ ...debtForm, startDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Maturity Date</label>
                  <input
                    type="date"
                    value={debtForm.maturityDate || ''}
                    onChange={(e) => setDebtForm({ ...debtForm, maturityDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setDebtModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
                >
                  Record Liability
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
