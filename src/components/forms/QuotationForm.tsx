import React from 'react';
import { QuotationData, QuotationItem, QuotationAddonOption } from '../../types/documents';
import { Plus, Trash2, Sparkles, CheckSquare, Square } from 'lucide-react';
import { sampleQuotation } from '../../services/sampleData';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { translateDocumentPayload } from '../../services/currency';
import { SignaturePicker } from '../documents/SignaturePicker';

interface QuotationFormProps {
  data: QuotationData;
  onChange: (data: QuotationData) => void;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof QuotationData>(key: K, value: QuotationData[K]) => {
    onChange({ ...data, [key]: value });
  };

  // Line items
  const handleLineItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    const list = [...(data.lineItems || [])];
    list[index] = { ...list[index], [field]: value };
    updateField('lineItems', list);
  };

  const addLineItem = () => {
    const newItem: QuotationItem = {
      id: `item-${Date.now()}`,
      title: '',
      description: '',
      quantity: 1,
      unit: 'Milestone',
      unitPrice: 2500,
      taxable: false
    };
    updateField('lineItems', [...(data.lineItems || []), newItem]);
  };

  const removeLineItem = (index: number) => {
    const list = (data.lineItems || []).filter((_, idx) => idx !== index);
    updateField('lineItems', list);
  };

  // Add-on options
  const handleAddonChange = (index: number, field: keyof QuotationAddonOption, value: any) => {
    const list = [...(data.addonOptions || [])];
    list[index] = { ...list[index], [field]: value };
    updateField('addonOptions', list);
  };

  const toggleAddonSelection = (index: number) => {
    const list = [...(data.addonOptions || [])];
    list[index] = { ...list[index], selected: !list[index].selected };
    updateField('addonOptions', list);
  };

  const addAddonOption = () => {
    const newAddon: QuotationAddonOption = {
      id: `addon-${Date.now()}`,
      title: '',
      description: '',
      price: 1500,
      selected: false
    };
    updateField('addonOptions', [...(data.addonOptions || []), newAddon]);
  };

  const removeAddonOption = (index: number) => {
    const list = (data.addonOptions || []).filter((_, idx) => idx !== index);
    updateField('addonOptions', list);
  };

  // Assumptions
  const handleAssumptionChange = (index: number, value: string) => {
    const list = [...(data.termsAndAssumptions || [])];
    list[index] = value;
    updateField('termsAndAssumptions', list);
  };

  const addAssumption = () => {
    updateField('termsAndAssumptions', [...(data.termsAndAssumptions || []), '']);
  };

  const removeAssumption = (index: number) => {
    const list = (data.termsAndAssumptions || []).filter((_, idx) => idx !== index);
    updateField('termsAndAssumptions', list);
  };

  // Calculations
  const subtotal = (data.lineItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const addonsTotal = (data.addonOptions || []).filter(a => a.selected).reduce((sum, a) => sum + a.price, 0);
  const baseTotal = subtotal + addonsTotal;
  const discountAmount = data.discountPercent ? (baseTotal * data.discountPercent) / 100 : 0;
  const taxableTotal = baseTotal - discountAmount;
  const taxAmount = data.taxPercent ? (taxableTotal * data.taxPercent) / 100 : 0;
  const grandTotal = taxableTotal + taxAmount;
  const currencySymbol = data.currencySymbol || '$';

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Quotation & Scope Estimate</h3>
          <p className="text-xs text-ink-500">Configure itemized deliverables, optional packages, commercial terms and client sign-off</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...sampleQuotation, quotationNumber: data.quotationNumber || sampleQuotation.quotationNumber })}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Quote Meta & Dates */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Quotation Specifications</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-ink-700">Quotation ID</label>
              <span className="text-[10px] text-ink-400 font-mono">Autofilled</span>
            </div>
            <input
              type="text"
              value={data.quotationNumber || ''}
              readOnly
              disabled
              placeholder="QT-2026-001"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-100/80 text-ink-700 font-mono font-semibold cursor-not-allowed select-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={data.issueDate || ''}
              onChange={(e) => updateField('issueDate', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Valid Until (Expiry)</label>
            <input
              type="date"
              value={data.validUntil || ''}
              onChange={(e) => updateField('validUntil', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-parchment-200 flex items-center justify-between">
          <label className="text-xs font-medium text-ink-700">Currency & Translation</label>
          <CurrencyToggle
            value={data.currency || 'USD'}
            onChange={(newCurr) => {
              const translated = translateDocumentPayload({ type: 'quotation', data }, newCurr);
              onChange(translated.data as QuotationData);
            }}
            showRateNotice={true}
            size="sm"
          />
        </div>
      </div>

      {/* Client Details */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Client / Recipient Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Company / Organization</label>
            <input
              type="text"
              value={data.clientCompany || ''}
              onChange={(e) => updateField('clientCompany', e.target.value)}
              placeholder="Client Company Inc."
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Primary Contact Name</label>
            <input
              type="text"
              value={data.clientName || ''}
              onChange={(e) => updateField('clientName', e.target.value)}
              placeholder="Full Name"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Email Address</label>
            <input
              type="email"
              value={data.clientEmail || ''}
              onChange={(e) => updateField('clientEmail', e.target.value)}
              placeholder="contact@client.com"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Phone Number (Optional)</label>
            <input
              type="text"
              value={data.clientPhone || ''}
              onChange={(e) => updateField('clientPhone', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-ink-700 mb-1">Billing & Physical Address</label>
            <textarea
              rows={2}
              value={data.clientAddress || ''}
              onChange={(e) => updateField('clientAddress', e.target.value)}
              placeholder="Street Address, City, State, ZIP"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
        </div>
      </div>

      {/* Project Scope & Timeline */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Project Overview</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Project Title</label>
            <input
              type="text"
              value={data.projectTitle || ''}
              onChange={(e) => updateField('projectTitle', e.target.value)}
              placeholder="e.g. Next-Gen Mobile App & Design System"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50 font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Scope & Objectives Summary</label>
            <textarea
              rows={3}
              value={data.projectScopeOverview || ''}
              onChange={(e) => updateField('projectScopeOverview', e.target.value)}
              placeholder="Brief summary of proposed work scope and key deliverables..."
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Estimated Delivery Timeline</label>
            <input
              type="text"
              value={data.timelineEstimate || ''}
              onChange={(e) => updateField('timelineEstimate', e.target.value)}
              placeholder="e.g. 6 to 8 calendar weeks from kickoff"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
        </div>
      </div>

      {/* Itemized Deliverables Table */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Itemized Deliverables & Scope</h4>
            <p className="text-[11px] text-ink-400">Detailed deliverables, milestones, or hourly units</p>
          </div>
          <button
            type="button"
            onClick={addLineItem}
            className="flex items-center gap-1 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 px-2.5 py-1.5 rounded transition font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Scope Item
          </button>
        </div>

        <div className="space-y-3">
          {(data.lineItems || []).map((item, idx) => (
            <div key={item.id || idx} className="p-3 bg-parchment-50/60 border border-parchment-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-ink-400">#{idx + 1}</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleLineItemChange(idx, 'title', e.target.value)}
                    placeholder="Deliverable title / Phase name"
                    className="w-full text-xs font-semibold p-1.5 border border-parchment-200 rounded bg-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(idx)}
                  className="p-1.5 text-ink-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                  title="Remove Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                  placeholder="Deliverable specifications, inclusions, and acceptance criteria..."
                  className="w-full text-xs p-1.5 border border-parchment-200 rounded bg-white text-ink-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <label className="block text-[10px] text-ink-500 mb-0.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 1)}
                    className="w-full text-xs p-1.5 border border-parchment-200 rounded bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-ink-500 mb-0.5">Unit Type</label>
                  <input
                    type="text"
                    value={item.unit || 'Milestone'}
                    onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                    placeholder="Sprint / Milestone / Hours"
                    className="w-full text-xs p-1.5 border border-parchment-200 rounded bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-ink-500 mb-0.5">Unit Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={item.unitPrice}
                    onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-1.5 border border-parchment-200 rounded bg-white font-mono text-right font-medium"
                  />
                </div>
              </div>

              <div className="text-right text-xs font-mono text-ink-600 pt-1">
                Line Subtotal: <span className="font-semibold text-ink-900">{currencySymbol}{(item.quantity * item.unitPrice).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {(!data.lineItems || data.lineItems.length === 0) && (
            <div className="text-center py-6 text-xs text-ink-400 border border-dashed border-parchment-300 rounded-lg">
              No scope items added yet. Click "Add Scope Item" to begin quoting.
            </div>
          )}
        </div>
      </div>

      {/* Optional Add-on Packages / Scope Upgrades */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Optional Add-on Packages & Upgrades</h4>
            <p className="text-[11px] text-ink-400">Additional modules or SLA retainers the client can opt into</p>
          </div>
          <button
            type="button"
            onClick={addAddonOption}
            className="flex items-center gap-1 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 px-2.5 py-1.5 rounded transition font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Add-on
          </button>
        </div>

        <div className="space-y-2.5">
          {(data.addonOptions || []).map((addon, idx) => (
            <div key={addon.id || idx} className="p-3 bg-parchment-50/50 border border-parchment-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => toggleAddonSelection(idx)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-ink-800"
                >
                  {addon.selected ? (
                    <CheckSquare className="w-4 h-4 text-clay-600" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-400" />
                  )}
                  <span>{addon.selected ? 'Included in Estimate' : 'Optional (Unchecked)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeAddonOption(idx)}
                  className="p-1 text-ink-400 hover:text-rose-600 transition"
                  title="Remove Add-on"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    value={addon.title}
                    onChange={(e) => handleAddonChange(idx, 'title', e.target.value)}
                    placeholder="Add-on title (e.g. 24/7 SLA, SEO Audit)"
                    className="w-full text-xs font-medium p-1.5 border border-parchment-200 rounded bg-white"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={addon.price}
                    onChange={(e) => handleAddonChange(idx, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="Price"
                    className="w-full text-xs font-mono text-right p-1.5 border border-parchment-200 rounded bg-white font-medium"
                  />
                </div>
              </div>

              <input
                type="text"
                value={addon.description}
                onChange={(e) => handleAddonChange(idx, 'description', e.target.value)}
                placeholder="Brief description of add-on benefit..."
                className="w-full text-xs p-1.5 border border-parchment-200 rounded bg-white text-ink-600"
              />
            </div>
          ))}
          {(!data.addonOptions || data.addonOptions.length === 0) && (
            <div className="text-center py-4 text-xs text-ink-400 italic">
              No optional add-ons specified.
            </div>
          )}
        </div>
      </div>

      {/* Commercial Summary & Adjustments */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Commercial Summary & Discounts</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.discountPercent ?? 0}
              onChange={(e) => updateField('discountPercent', parseFloat(e.target.value) || 0)}
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Estimated Tax / VAT (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={data.taxPercent ?? 0}
              onChange={(e) => updateField('taxPercent', parseFloat(e.target.value) || 0)}
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50 font-mono"
            />
          </div>
        </div>

        {/* Live Calculation Panel */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-3 space-y-1.5 font-mono text-xs">
          <div className="flex justify-between text-ink-600">
            <span>Scope Deliverables Subtotal:</span>
            <span>{currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          {addonsTotal > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Selected Add-ons Total:</span>
              <span>+{currencySymbol}{addonsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-forest-700 font-medium">
              <span>Discount ({data.discountPercent}%):</span>
              <span>-{currencySymbol}{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-ink-600">
              <span>Estimated Tax ({data.taxPercent}%):</span>
              <span>+{currencySymbol}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-ink-950 text-sm border-t border-parchment-300 pt-1.5">
            <span>Total Estimated Investment:</span>
            <span className="text-clay-700">{currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Payment Terms & Conditions */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Payment Terms & Acceptance Conditions</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Commercial Payment Schedule</label>
            <textarea
              rows={2}
              value={data.paymentTerms || ''}
              onChange={(e) => updateField('paymentTerms', e.target.value)}
              placeholder="e.g. 50% upfront deposit to initiate sprint, 50% upon deployment."
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-ink-700">Terms, Validity & Assumptions</label>
              <button
                type="button"
                onClick={addAssumption}
                className="text-[11px] text-clay-700 hover:text-clay-800 font-medium"
              >
                + Add Clause
              </button>
            </div>
            <div className="space-y-1.5">
              {(data.termsAndAssumptions || []).map((term, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="text-xs text-ink-400">•</span>
                  <input
                    type="text"
                    value={term}
                    onChange={(e) => handleAssumptionChange(idx, e.target.value)}
                    placeholder="e.g. Scope changes will be quoted under separate change order..."
                    className="flex-1 text-xs p-1.5 border border-parchment-200 rounded bg-parchment-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => removeAssumption(idx)}
                    className="p-1 text-ink-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agency Authorized Signatures from Signature Store */}
      <SignaturePicker
        value={data.agencySigners}
        onChange={(selection) => updateField('agencySigners', selection)}
        title="Agency Quotation Authorization"
        description="Pick authorized partner signature(s) from your Signature Store. Supports Dual Signatures for both partners."
      />

      {/* Client Sign-off Block */}
      <div className="bg-white border border-parchment-200 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Client Sign-Off & Acceptance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Authorized Signer Name</label>
            <input
              type="text"
              value={data.clientSignerName || ''}
              onChange={(e) => updateField('clientSignerName', e.target.value)}
              placeholder="e.g. Sophia Lin"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Signer Title</label>
            <input
              type="text"
              value={data.clientSignerTitle || ''}
              onChange={(e) => updateField('clientSignerTitle', e.target.value)}
              placeholder="e.g. VP of Product"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-ink-700 mb-1">Acceptance Notes / Purchase Order Reference</label>
            <input
              type="text"
              value={data.acceptanceNotes || ''}
              onChange={(e) => updateField('acceptanceNotes', e.target.value)}
              placeholder="e.g. Approved under PO #2026-AERO-01"
              className="w-full text-xs p-2 border border-parchment-200 rounded bg-parchment-50/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
