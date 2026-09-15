import React from 'react';
import { InvoiceData, InvoiceLineItem } from '../../types/documents';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { sampleInvoice } from '../../services/sampleData';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { translateDocumentPayload } from '../../services/currency';
import { SignaturePicker } from '../documents/SignaturePicker';

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const list = [...(data.lineItems || [])];
    list[index] = { ...list[index], [field]: value };
    updateField('lineItems', list);
  };

  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 1000,
      taxable: false
    };
    updateField('lineItems', [...(data.lineItems || []), newItem]);
  };

  const removeLineItem = (index: number) => {
    const list = (data.lineItems || []).filter((_, idx) => idx !== index);
    updateField('lineItems', list);
  };

  const subtotal = (data.lineItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = data.discountPercent ? (subtotal * data.discountPercent) / 100 : 0;
  const taxableTotal = subtotal - discountAmount;
  const taxAmount = data.taxPercent ? (taxableTotal * data.taxPercent) / 100 : 0;
  const grandTotal = taxableTotal + taxAmount;

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Commercial Invoice</h3>
          <p className="text-xs text-ink-500">Configure itemized client billing, tax rates, payment terms and bank details</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...sampleInvoice, invoiceNumber: data.invoiceNumber || sampleInvoice.invoiceNumber })}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Invoice Meta */}
      <div className="grid grid-cols-4 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-ink-700">Invoice ID</label>
            <span className="text-[10px] text-ink-400 font-mono">Autofilled</span>
          </div>
          <input
            type="text"
            value={data.invoiceNumber}
            readOnly
            disabled
            className="w-full text-xs p-2 border border-parchment-300 rounded font-mono font-semibold bg-parchment-100/80 text-ink-700 cursor-not-allowed select-all"
            placeholder="INV-2026-001"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Issue Date</label>
          <input
            type="date"
            value={data.issueDate}
            onChange={(e) => updateField('issueDate', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Due Date</label>
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => updateField('dueDate', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">PO Number (Optional)</label>
          <input
            type="text"
            value={data.poNumber || ''}
            onChange={(e) => updateField('poNumber', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
            placeholder="PO-001"
          />
        </div>
      </div>

      <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-2.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-700">Billing Currency (USD / INR)</span>
        <CurrencyToggle
          value={data.currency || 'USD'}
          onChange={(newCurr) => {
            const translated = translateDocumentPayload({ type: 'invoice', data }, newCurr);
            onChange(translated.data as InvoiceData);
          }}
          showRateNotice={true}
          size="sm"
        />
      </div>

      {/* Billed To Client */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Bill To Client</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Company / Entity</label>
            <input
              type="text"
              value={data.clientCompany}
              onChange={(e) => updateField('clientCompany', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="e.g. AeroSync Technologies"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="e.g. Sophia Lin"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Email</label>
            <input
              type="email"
              value={data.clientEmail}
              onChange={(e) => updateField('clientEmail', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="billing@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Tax / VAT ID (Optional)</label>
            <input
              type="text"
              value={data.clientTaxId || ''}
              onChange={(e) => updateField('clientTaxId', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
              placeholder="EIN / VAT"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={data.currencySymbol || '$'}
              onChange={(e) => updateField('currencySymbol', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="$"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Client Address</label>
          <textarea
            rows={2}
            value={data.clientAddress}
            onChange={(e) => updateField('clientAddress', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Street Address, City, State, ZIP, Country"
          />
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-xs font-semibold text-ink-800 uppercase tracking-wider">Line Items & Services</label>
            <p className="text-[11px] text-ink-500">Itemize the services, rates, and quantities</p>
          </div>
          <button
            type="button"
            onClick={addLineItem}
            className="text-xs text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium bg-clay-50 px-2 py-1 rounded border border-clay-200"
          >
            <Plus className="w-3.5 h-3.5" /> Add Line Item
          </button>
        </div>

        <div className="space-y-2">
          {(data.lineItems || []).map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-parchment-50/50 p-2 rounded border border-parchment-200">
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                className="col-span-6 text-xs p-1.5 border border-parchment-300 rounded bg-white"
                placeholder="Service or milestone description..."
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                className="col-span-2 text-xs p-1.5 border border-parchment-300 rounded bg-white font-mono text-center"
                placeholder="Qty"
              />
              <input
                type="number"
                value={item.unitPrice}
                onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                className="col-span-3 text-xs p-1.5 border border-parchment-300 rounded bg-white font-mono text-right"
                placeholder="Unit Price"
              />
              <button
                type="button"
                onClick={() => removeLineItem(idx)}
                className="col-span-1 text-ink-400 hover:text-red-500 p-1 text-center"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Adjustments: Discount & Tax */}
      <div className="grid grid-cols-3 gap-4 bg-parchment-50 p-4 rounded border border-parchment-200">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Discount (% optional)</label>
          <input
            type="number"
            value={data.discountPercent || 0}
            onChange={(e) => updateField('discountPercent', parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2 border border-parchment-300 rounded bg-white"
            min={0}
            max={100}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Tax Rate (% optional)</label>
          <input
            type="number"
            value={data.taxPercent || 0}
            onChange={(e) => updateField('taxPercent', parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2 border border-parchment-300 rounded bg-white"
            min={0}
            max={100}
          />
        </div>
        <div className="text-right flex flex-col justify-center">
          <div className="text-[11px] text-ink-500 uppercase tracking-wider">Calculated Grand Total</div>
          <div className="text-xl font-mono font-bold text-clay-700">
            {data.currencySymbol || '$'}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Payment Instructions & Notes */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Payment Instructions</label>
          <textarea
            rows={2}
            value={data.paymentInstructions}
            onChange={(e) => updateField('paymentInstructions', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Wire instructions, payment link, or ACH memo requirements..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Terms & Conditions / Memo</label>
          <textarea
            rows={2}
            value={data.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Thank you for your business. Net 15 days."
          />
        </div>
      </div>

      {/* Agency Authorized Signatures from Signature Store */}
      <SignaturePicker
        value={data.agencySigners}
        onChange={(selection) => updateField('agencySigners', selection)}
        title="Invoice Authorized Signatory"
        description="Select authorized partner signature(s) from your Signature Store to stamp this invoice."
      />
    </div>
  );
};

