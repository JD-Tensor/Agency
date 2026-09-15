import React, { useState } from 'react';
import { 
  Coins, 
  Plus, 
  Edit2
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { 
  CapitalContributionRecord, 
  PartnerEquityRecord, 
  ContributionType 
} from '../../types/partnership';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { convertAmount, CurrencyCode } from '../../services/currency';

export const CapitalEquityView: React.FC = () => {
  const { 
    capitalContributions, 
    partnerEquity, 
    addNewCapitalContribution, 
    updatePartnerEquityItem, 
    currentUser,
    agencyProfile,
    activeCurrency,
    setActiveCurrency,
    formatMoney
  } = useAgency();

  const [contribModalOpen, setContribModalOpen] = useState(false);
  const [editEquityModalOpen, setEditEquityModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<PartnerEquityRecord | null>(null);

  const [contribForm, setContribForm] = useState<Partial<CapitalContributionRecord>>({
    partnerName: 'Subhadip Jana',
    partnerId: 'usr-subhadip',
    amount: 15000,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    contributionType: 'cash_infusion',
    transactionRef: 'WIRE-CAP-0924',
    bankAccount: 'HDFC Commercial Banking (...0194)',
    notes: 'Capital injection for Q3 engineering capacity expansion.'
  });

  const [equityForm, setEquityForm] = useState<{
    designation: string;
    ownershipPercentage: number;
    profitSharePercentage: number;
  }>({
    designation: '',
    ownershipPercentage: 50,
    profitSharePercentage: 50,
  });

  // Signatures live in Agency Settings > Signature Store; match by partner id, then by name
  const getPartnerSignature = (partner: PartnerEquityRecord) => {
    const store = agencyProfile.signatureStore || [];
    const matches = store.filter(s => s.partnerId === partner.partnerId || s.name === partner.partnerName);
    return (matches.find(s => s.isDefault) || matches[0])?.signatureImage || partner.signatureImage;
  };

  const canManageEquity = currentUser?.roleLevel !== undefined ? currentUser.roleLevel === 100 : true;

  const totalFirmCapital = partnerEquity.reduce((sum, p) => sum + p.netCapitalBalance, 0);

  const handleSaveContrib = async (e: React.FormEvent) => {
    e.preventDefault();
    await addNewCapitalContribution(contribForm);
    setContribModalOpen(false);
  };

  const handleSaveEquity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPartner) {
      await updatePartnerEquityItem(selectedPartner.partnerId, equityForm);
      setEditEquityModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-ink-950">Partnership Capital & Equity</h1>
            <span className="text-xs bg-clay-100 text-clay-800 font-semibold px-2 py-0.5 rounded-full">
              Ledgers 5 & 6 of 10
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Official Partnership Deed capital accounts, equity splits, and contribution ledger for Subhadip Jana & Shayan Das.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <CurrencyToggle 
            value={activeCurrency} 
            onChange={setActiveCurrency} 
            size="sm" 
            showRateNotice={true} 
          />

          {canManageEquity && (
            <button
              onClick={() => setContribModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-clay-600 hover:bg-clay-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Inject Capital Contribution
            </button>
          )}
        </div>
      </div>

      {/* Partner Equity Cards (Subhadip Jana & Shayan Das) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partnerEquity.map((partner) => (
          <div key={partner.partnerId} className="bg-white rounded-xl border border-parchment-200 p-6 shadow-xs relative overflow-hidden">
            {/* Top Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-clay-500 to-clay-700" />

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif font-bold text-ink-950">{partner.partnerName}</h2>
                  <span className="text-xs bg-clay-50 text-clay-700 border border-clay-200 font-semibold px-2 py-0.5 rounded-full">
                    Founding Partner
                  </span>
                </div>
                <div className="text-xs text-ink-500 font-medium mt-0.5">{partner.designation}</div>
                <div className="text-xs text-ink-400">{partner.email}</div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold font-serif text-clay-700">
                  {partner.ownershipPercentage}%
                </div>
                <div className="text-[11px] uppercase font-semibold text-ink-400 tracking-wider">
                  Equity Stake
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="grid grid-cols-3 gap-3 mt-6 p-4 bg-parchment-50 rounded-xl border border-parchment-200/70">
              <div>
                <div className="text-[10px] uppercase font-semibold text-ink-400">Total Contributed</div>
                <div className="text-base font-bold font-mono text-ink-900 mt-0.5">
                  {formatMoney(partner.totalContributed)}
                </div>
                <div className="text-[10px] text-ink-500">Initial: {formatMoney(partner.initialCapitalContribution)}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-semibold text-ink-400">Drawings Taken</div>
                <div className="text-base font-bold font-mono text-rose-700 mt-0.5">
                  -{formatMoney(partner.totalDrawings)}
                </div>
                <div className="text-[10px] text-ink-500">Distributions</div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-semibold text-ink-400">Net Capital Balance</div>
                <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                  {formatMoney(partner.netCapitalBalance)}
                </div>
                <div className="text-[10px] text-emerald-600 font-medium">In Firm Account</div>
              </div>
            </div>

            {/* Signature specimen */}
            <div className="mt-5 pt-4 border-t border-parchment-200/80 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-semibold text-ink-400 tracking-wider">
                  Deed Signature Specimen
                </div>
                {getPartnerSignature(partner) ? (
                  <div className="h-10 mt-1 flex items-center">
                    <img 
                      src={getPartnerSignature(partner)} 
                      alt={`${partner.partnerName} signature`} 
                      className="max-h-10 object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-xs italic text-ink-400 mt-1 font-serif">
                    Digitally registered under Indian Partnership Act, 1932
                  </div>
                )}
              </div>

              {canManageEquity && (
                <button
                  onClick={() => {
                    setSelectedPartner(partner);
                    setEquityForm({
                      designation: partner.designation,
                      ownershipPercentage: partner.ownershipPercentage,
                      profitSharePercentage: partner.profitSharePercentage
                    });
                    setEditEquityModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs text-clay-600 hover:text-clay-800 font-semibold px-2 py-1 rounded hover:bg-clay-50"
                >
                  <Edit2 className="w-3 h-3" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Firm Capital Summary Card */}
      <div className="bg-white rounded-xl border border-parchment-200 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Total Firm Net Paid-In Capital</div>
            <div className="text-2xl font-bold font-serif text-ink-950">{formatMoney(totalFirmCapital)}</div>
            <div className="text-xs text-ink-500 mt-0.5">
              Held across commercial banking reserves and operating liquidity accounts
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="text-right">
            <div className="text-xs text-ink-400">Profit Sharing Ratio</div>
            <div className="font-semibold text-ink-800">50% Subhadip / 50% Shayan</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-ink-400">Firm Registration</div>
            <div className="font-semibold text-ink-800">Govt. Partnership Reg: WB/KOL/2025/089</div>
          </div>
        </div>
      </div>

      {/* Capital Contributions History Table */}
      <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-parchment-200 flex items-center justify-between">
          <h2 className="text-base font-serif font-bold text-ink-950">Capital Infusion & Contribution Registry</h2>
          <span className="text-xs text-ink-500 font-medium">All partner deposits & equity injections</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Contribution Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Tx Ref / Bank Account</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100 text-sm">
              {capitalContributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-ink-400 text-xs">No capital contributions recorded.</td>
                </tr>
              ) : (
                capitalContributions.map((c) => (
                  <tr key={c.id} className="hover:bg-parchment-50/50">
                    <td className="py-3 px-4 font-semibold text-ink-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-clay-100 text-clay-700 flex items-center justify-center text-xs font-bold">
                          {c.partnerName.charAt(0)}
                        </div>
                        {c.partnerName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-600">{c.date}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 capitalize">
                        {c.contributionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      +{formatMoney(c.amount, c.currency)}
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-600">
                      <div className="font-mono font-medium text-ink-800">{c.transactionRef}</div>
                      <div className="text-ink-400 text-[11px]">{c.bankAccount}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-ink-500 max-w-xs truncate">{c.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inject Capital Modal */}
      {contribModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-md w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">Record Capital Contribution</h2>
            <form onSubmit={handleSaveContrib} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Partner</label>
                <select
                  value={contribForm.partnerName}
                  onChange={(e) => {
                    const name = e.target.value as any;
                    const id = name === 'Subhadip Jana' ? 'usr-subhadip' : 'usr-shayan';
                    setContribForm({ ...contribForm, partnerName: name, partnerId: id });
                  }}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                >
                  <option value="Subhadip Jana">Subhadip Jana</option>
                  <option value="Shayan Das">Shayan Das</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase text-ink-700">
                      Amount ({contribForm.currency === 'INR' ? '₹' : '$'})
                    </label>
                    <CurrencyToggle
                      value={contribForm.currency || activeCurrency}
                      onChange={(curr) => {
                        const prevCurr = (contribForm.currency || activeCurrency) as CurrencyCode;
                        const converted = convertAmount(contribForm.amount || 0, prevCurr, curr);
                        setContribForm({ ...contribForm, currency: curr, amount: converted });
                      }}
                      size="sm"
                    />
                  </div>
                  <input
                    type="number"
                    required
                    value={contribForm.amount || 0}
                    onChange={(e) => setContribForm({ ...contribForm, amount: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700 mb-1 block">Date</label>
                  <input
                    type="date"
                    required
                    value={contribForm.date || ''}
                    onChange={(e) => setContribForm({ ...contribForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Contribution Type</label>
                <select
                  value={contribForm.contributionType}
                  onChange={(e) => setContribForm({ ...contribForm, contributionType: e.target.value as ContributionType })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                >
                  <option value="cash_infusion">Direct Cash Infusion</option>
                  <option value="equipment_hardware">Hardware / Infrastructure Asset</option>
                  <option value="ip_valuation">Intellectual Property Assignment</option>
                  <option value="initial_capital">Initial Deed Capital</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Transaction Ref</label>
                  <input
                    type="text"
                    required
                    value={contribForm.transactionRef || ''}
                    onChange={(e) => setContribForm({ ...contribForm, transactionRef: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Depositing Bank</label>
                  <input
                    type="text"
                    value={contribForm.bankAccount || ''}
                    onChange={(e) => setContribForm({ ...contribForm, bankAccount: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Notes / Resolution</label>
                <textarea
                  rows={2}
                  value={contribForm.notes || ''}
                  onChange={(e) => setContribForm({ ...contribForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setContribModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg"
                >
                  Record Contribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Designation / Equity Modal */}
      {editEquityModalOpen && selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-md w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">
              Update Partner Details: {selectedPartner.partnerName}
            </h2>
            <form onSubmit={handleSaveEquity} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Designation / Role Title</label>
                <input
                  type="text"
                  required
                  value={equityForm.designation}
                  onChange={(e) => setEquityForm({ ...equityForm, designation: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Ownership %</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={equityForm.ownershipPercentage}
                    onChange={(e) => setEquityForm({ ...equityForm, ownershipPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Profit Share %</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={equityForm.profitSharePercentage}
                    onChange={(e) => setEquityForm({ ...equityForm, profitSharePercentage: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Specimen Signature</label>
                <div className="mt-1 flex items-center justify-between gap-3 px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-lg">
                  {getPartnerSignature(selectedPartner) ? (
                    <img
                      src={getPartnerSignature(selectedPartner)}
                      alt={`${selectedPartner.partnerName} signature`}
                      className="max-h-10 object-contain"
                    />
                  ) : (
                    <span className="text-xs italic text-ink-400">No signature found</span>
                  )}
                  <span className="text-[11px] text-ink-500 text-right">Managed in Agency Settings &rsaquo; Signature Store</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setEditEquityModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
