import React from 'react';
import { InvoiceData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentFooter } from './DocumentHeader';

interface InvoiceTemplateProps {
  data: InvoiceData;
  agency: AgencyProfile;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ data, agency }) => {
  const currencySymbol = data.currencySymbol || agency.currencySymbol || '$';

  const subtotal = data.lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const discountAmount = data.discountPercent ? (subtotal * data.discountPercent) / 100 : 0;
  const taxableTotal = subtotal - discountAmount;
  const taxAmount = data.taxPercent ? (taxableTotal * data.taxPercent) / 100 : 0;
  const grandTotal = taxableTotal + taxAmount;

  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      {/* Header & Meta */}
      <div className="border-b border-parchment-300 pb-6 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full bg-clay-600 inline-block"></span>
            <span className="text-sm font-semibold tracking-wider uppercase text-ink-700">
              {agency.name}
            </span>
          </div>
          <div className="text-xs text-ink-500">{agency.address}</div>
          <div className="text-xs text-ink-500">{agency.cityStateZip}, {agency.country}</div>
          <div className="text-xs text-ink-500">Email: {agency.email}</div>
          {agency.taxId && (
            <div className="text-xs text-ink-500 mt-1">Tax / VAT ID: <span className="font-mono text-ink-700">{agency.taxId}</span></div>
          )}
        </div>

        <div className="text-right">
          <h1 className="text-3xl font-serif text-ink-950 font-normal tracking-tight mb-1">
            INVOICE
          </h1>
          <div className="text-sm font-mono font-semibold text-clay-700">
            {data.invoiceNumber || 'INV-001'}
          </div>
          <div className="text-xs text-ink-600 mt-2 space-y-0.5">
            <div>Issue Date: <span className="font-medium text-ink-800">{data.issueDate}</span></div>
            <div>Due Date: <span className="font-semibold text-clay-700">{data.dueDate}</span></div>
            {data.poNumber && <div>PO Number: <span className="font-mono text-ink-700">{data.poNumber}</span></div>}
          </div>
        </div>
      </div>

      {/* Bill To Info */}
      <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-6">
        <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
          Billed To Client
        </div>
        <div className="font-semibold text-ink-950 text-sm">{data.clientCompany || data.clientName}</div>
        <div className="text-xs text-ink-700">Attn: {data.clientName}</div>
        <div className="text-xs text-ink-500 whitespace-pre-line mt-0.5">{data.clientAddress}</div>
        <div className="text-xs text-ink-500">{data.clientEmail}</div>
        {data.clientTaxId && (
          <div className="text-xs text-ink-500 mt-1">Client Tax ID: <span className="font-mono">{data.clientTaxId}</span></div>
        )}
      </div>

      {/* Line Items Table */}
      <div className="mb-6">
        <table className="w-full text-xs border border-parchment-200 rounded print:overflow-visible">
          <thead className="bg-parchment-100 text-ink-600 font-semibold text-[10px] uppercase">
            <tr>
              <th className="text-left p-2.5 border-b border-parchment-200">Description</th>
              <th className="text-right p-2.5 border-b border-parchment-200 w-16">Qty</th>
              <th className="text-right p-2.5 border-b border-parchment-200 w-28">Unit Rate</th>
              <th className="text-right p-2.5 border-b border-parchment-200 w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-parchment-200">
            {data.lineItems && data.lineItems.length > 0 ? (
              data.lineItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-parchment-50/50">
                  <td className="p-2.5 text-ink-900 font-medium">{item.description}</td>
                  <td className="p-2.5 text-right text-ink-700 font-mono">{item.quantity}</td>
                  <td className="p-2.5 text-right text-ink-700 font-mono">
                    {currencySymbol}{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2.5 text-right text-ink-900 font-semibold font-mono">
                    {currencySymbol}{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-ink-400 italic">No line items</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals & Notes */}
      <div className="flex justify-end mb-6 keep-together">
        <div className="w-64 space-y-1.5 text-xs bg-parchment-50 p-3.5 rounded border border-parchment-200">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal:</span>
            <span className="font-mono text-ink-900">{currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>

          {data.discountPercent ? (
            <div className="flex justify-between text-forest-700">
              <span>Discount ({data.discountPercent}%):</span>
              <span className="font-mono">-{currencySymbol}{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          ) : null}

          {data.taxPercent ? (
            <div className="flex justify-between text-ink-600">
              <span>Tax ({data.taxPercent}%):</span>
              <span className="font-mono text-ink-900">+{currencySymbol}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          ) : null}

          <div className="border-t border-parchment-300 pt-2 flex justify-between items-baseline font-bold text-sm text-ink-950">
            <span>Total Due:</span>
            <span className="text-lg font-mono text-clay-700">
              {currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Details & Bank Coordinates */}
      <div className="grid grid-cols-2 gap-4 mb-6 keep-together">
        <div className="border border-parchment-200 rounded p-3 bg-parchment-50/50 text-xs">
          <div className="text-[10px] uppercase font-semibold text-ink-600 tracking-wider mb-1.5">
            Bank & Wire Coordinates
          </div>
          <div className="space-y-0.5 text-ink-800 text-[11px]">
            <div><span className="font-medium text-ink-600">Bank:</span> {agency.bankDetails.bankName}</div>
            <div><span className="font-medium text-ink-600">Beneficiary:</span> {agency.bankDetails.accountHolder}</div>
            <div><span className="font-medium text-ink-600">Account:</span> <span className="font-mono">{agency.bankDetails.accountNumber}</span></div>
            <div><span className="font-medium text-ink-600">SWIFT/Routing:</span> <span className="font-mono">{agency.bankDetails.routingOrSwift}</span></div>
            {agency.bankDetails.iban && <div><span className="font-medium text-ink-600">IBAN:</span> <span className="font-mono">{agency.bankDetails.iban}</span></div>}
          </div>
        </div>

        <div className="border border-parchment-200 rounded p-3 bg-white text-xs">
          <div className="text-[10px] uppercase font-semibold text-ink-600 tracking-wider mb-1.5">
            Instructions & Terms
          </div>
          <p className="text-ink-700 text-[11px] leading-relaxed">
            {data.paymentInstructions || agency.bankDetails.notes || 'Payment due as indicated above.'}
          </p>
          {data.notes && (
            <p className="text-ink-500 text-[10px] mt-2 border-t border-parchment-200 pt-1.5">
              {data.notes}
            </p>
          )}
        </div>
      </div>

      {/* Authorized Signature Block */}
      <div className="border-t border-parchment-200 pt-4 mb-6 keep-together flex justify-end">
        {data.agencySigners?.mode === 'dual' ? (
          <div className="flex items-end gap-8">
            {/* Partner 1 */}
            <div className="text-right min-w-[150px]">
              <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1">
                Authorized Signatory
              </div>
              <div className="h-10 flex items-end justify-end mb-1">
                {data.agencySigners.signer1Image ? (
                  <img
                    src={data.agencySigners.signer1Image}
                    alt="Signatory 1"
                    className="max-h-9 max-w-[140px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-base text-ink-900">
                    {data.agencySigners.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                  </span>
                )}
              </div>
              <div className="border-t border-parchment-300 pt-1 text-xs font-semibold text-ink-900">
                {data.agencySigners.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
              </div>
              <div className="text-[10px] text-ink-500">
                {data.agencySigners.signer1Title || 'Senior Managing Partner'}
              </div>
            </div>

            {/* Partner 2 */}
            <div className="text-right min-w-[150px]">
              <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1">
                Authorized Signatory
              </div>
              <div className="h-10 flex items-end justify-end mb-1">
                {data.agencySigners.signer2Image ? (
                  <img
                    src={data.agencySigners.signer2Image}
                    alt="Signatory 2"
                    className="max-h-9 max-w-[140px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-base text-ink-900">
                    {data.agencySigners.signer2Name || 'Shayan Das'}
                  </span>
                )}
              </div>
              <div className="border-t border-parchment-300 pt-1 text-xs font-semibold text-ink-900">
                {data.agencySigners.signer2Name || 'Shayan Das'}
              </div>
              <div className="text-[10px] text-ink-500">
                {data.agencySigners.signer2Title || 'Senior Managing Partner'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-right w-60">
            <div className="text-[10px] uppercase tracking-wider text-ink-400 font-semibold mb-1">
              Authorized Signatory
            </div>
            <div className="h-10 flex items-end justify-end mb-1">
              {data.agencySigners?.signer1Image || agency.primarySigner?.signatureImage ? (
                <img
                  src={data.agencySigners?.signer1Image || agency.primarySigner?.signatureImage}
                  alt="Authorized Signature"
                  className="max-h-9 max-w-[160px] object-contain"
                />
              ) : (
                <span className="font-serif italic text-base text-ink-900">
                  {data.agencySigners?.signer1Name || agency.primarySigner?.signatureText || agency.primarySigner?.name || 'Subhadip Jana'}
                </span>
              )}
            </div>
            <div className="border-t border-parchment-300 pt-1 text-xs font-semibold text-ink-900">
              {data.agencySigners?.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
            </div>
            <div className="text-[10px] text-ink-500">
              {data.agencySigners?.signer1Title || agency.primarySigner?.title || 'Senior Managing Partner'}
            </div>
          </div>
        )}
      </div>

      <DocumentFooter 
        agency={agency} 
        confidentialNotice="Thank you for your business. For billing questions, contact us via email."
      />
    </div>
  );
};

