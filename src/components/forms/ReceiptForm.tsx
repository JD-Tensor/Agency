import React from 'react';
import { ReceiptData } from '../../types/documents';
import { Sparkles } from 'lucide-react';
import { sampleReceipt } from '../../services/sampleData';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { translateDocumentPayload } from '../../services/currency';
import { SignaturePicker } from '../documents/SignaturePicker';

interface ReceiptFormProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
}

export const ReceiptForm: React.FC<ReceiptFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof ReceiptData>(key: K, value: ReceiptData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Payment Receipt</h3>
          <p className="text-xs text-ink-500">Issue official settlement acknowledgment & payment confirmation</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...sampleReceipt, receiptNumber: data.receiptNumber || sampleReceipt.receiptNumber })}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Identifiers */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-ink-700">Receipt ID</label>
            <span className="text-[10px] text-ink-400 font-mono">Autofilled</span>
          </div>
          <input
            type="text"
            value={data.receiptNumber}
            readOnly
            disabled
            className="w-full text-xs p-2 border border-parchment-300 rounded font-mono font-semibold bg-parchment-100/80 text-ink-700 cursor-not-allowed select-all"
            placeholder="RCT-2026-001"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Original Invoice # Ref</label>
          <input
            type="text"
            value={data.originalInvoiceNumber}
            onChange={(e) => updateField('originalInvoiceNumber', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
            placeholder="INV-2026-0189"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Payment Received Date</label>
          <input
            type="date"
            value={data.paymentDate}
            onChange={(e) => updateField('paymentDate', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
          />
        </div>
      </div>

      <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-2.5 flex items-center justify-between">
        <span className="text-xs font-medium text-ink-700">Receipt Currency (USD / INR)</span>
        <CurrencyToggle
          value={data.currency || 'USD'}
          onChange={(newCurr) => {
            const translated = translateDocumentPayload({ type: 'receipt', data }, newCurr);
            onChange(translated.data as ReceiptData);
          }}
          showRateNotice={true}
          size="sm"
        />
      </div>

      {/* Client Payer */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Received From</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Company</label>
            <input
              type="text"
              value={data.clientCompany}
              onChange={(e) => updateField('clientCompany', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="AeroSync Technologies"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Contact Name</label>
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="Sophia Lin"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Email</label>
            <input
              type="email"
              value={data.clientEmail}
              onChange={(e) => updateField('clientEmail', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="billing@example.com"
            />
          </div>
        </div>
      </div>

      {/* Payment Amounts & Method */}
      <div className="grid grid-cols-3 gap-3 bg-parchment-50 p-4 rounded border border-parchment-200">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Amount Paid ($)</label>
          <input
            type="number"
            value={data.amountPaid}
            onChange={(e) => updateField('amountPaid', parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2 border border-parchment-300 rounded bg-white font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Payment Method</label>
          <select
            value={data.paymentMethod}
            onChange={(e) => updateField('paymentMethod', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded bg-white"
          >
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="Bank Transfer">Bank Transfer / ACH</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Stripe">Stripe</option>
            <option value="PayPal">PayPal</option>
            <option value="Cash">Cash / Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Remaining Balance ($)</label>
          <input
            type="number"
            value={data.balanceRemaining}
            onChange={(e) => updateField('balanceRemaining', parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2 border border-parchment-300 rounded bg-white font-mono text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Transaction Reference / Confirmation ID</label>
        <input
          type="text"
          value={data.transactionReference}
          onChange={(e) => updateField('transactionReference', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
          placeholder="e.g. WIRE-SVCB-20260914-99824"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Received For (Description of Services)</label>
        <textarea
          rows={2}
          value={data.receivedForDescription}
          onChange={(e) => updateField('receivedForDescription', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded"
          placeholder="Payment in full for Phase 1 Design System & Phase 2 Kickoff..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Thank You Note / Customer Message</label>
        <input
          type="text"
          value={data.thankYouMessage}
          onChange={(e) => updateField('thankYouMessage', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded"
          placeholder="Thank you for your prompt payment. We value your partnership."
        />
      </div>

      {/* Agency Authorized Signatures from Signature Store */}
      <SignaturePicker
        value={data.agencySigners}
        onChange={(selection) => updateField('agencySigners', selection)}
        title="Official Verification & Settlement Signatory"
        description="Select authorized partner signature(s) from your Signature Store to stamp this receipt."
      />
    </div>
  );
};

