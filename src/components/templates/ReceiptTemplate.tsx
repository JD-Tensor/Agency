import React from 'react';
import { ReceiptData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentFooter } from './DocumentHeader';

interface ReceiptTemplateProps {
  data: ReceiptData;
  agency: AgencyProfile;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ data, agency }) => {
  const currencySymbol = data.currencySymbol || agency.currencySymbol || '$';

  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      {/* Header with PAID Seal */}
      <div className="border-b border-parchment-300 pb-6 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full bg-forest-700 inline-block"></span>
            <span className="text-sm font-semibold tracking-wider uppercase text-ink-700">
              {agency.name}
            </span>
          </div>
          <div className="text-xs text-ink-500">{agency.address}</div>
          <div className="text-xs text-ink-500">{agency.cityStateZip}, {agency.country}</div>
          <div className="text-xs text-ink-500">Email: {agency.email}</div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold tracking-wider uppercase mb-2">
            <span>✓</span> PAYMENT RECEIVED
          </div>
          <h1 className="text-2xl font-serif text-ink-950 font-normal tracking-tight">
            Official Receipt
          </h1>
          <div className="text-sm font-mono font-semibold text-ink-800">
            {data.receiptNumber || 'RCT-001'}
          </div>
          <div className="text-xs text-ink-500 mt-1">
            Date: <span className="font-medium text-ink-800">{data.paymentDate}</span>
          </div>
        </div>
      </div>

      {/* Recipient & Payment Details */}
      <div className="grid grid-cols-2 gap-4 bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-6 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Received From
          </div>
          <div className="font-semibold text-ink-950 text-sm">{data.clientCompany || data.clientName}</div>
          <div className="text-ink-700">{data.clientName}</div>
          <div className="text-ink-500">{data.clientEmail}</div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Transaction Details
          </div>
          <div>
            <span className="text-ink-500">Invoice Reference:</span>{' '}
            <span className="font-mono font-semibold text-ink-800">{data.originalInvoiceNumber}</span>
          </div>
          <div>
            <span className="text-ink-500">Payment Method:</span>{' '}
            <span className="font-medium text-ink-800">{data.paymentMethod}</span>
          </div>
          <div>
            <span className="text-ink-500">Transaction ID:</span>{' '}
            <span className="font-mono text-ink-700">{data.transactionReference}</span>
          </div>
        </div>
      </div>

      {/* Amount Box */}
      <div className="bg-forest-50/70 border border-forest-700/20 rounded-lg p-6 mb-6 text-center">
        <div className="text-xs uppercase font-semibold tracking-wider text-forest-700 mb-1">
          Total Amount Successfully Paid
        </div>
        <div className="text-3xl font-mono font-bold text-ink-950">
          {currencySymbol}{data.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-ink-600 mt-2">
          Outstanding Balance: <span className="font-mono font-semibold text-ink-800">{currencySymbol}{data.balanceRemaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6 text-xs">
        <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1.5">
          Payment Purpose / Description
        </div>
        <div className="bg-white border border-parchment-200 p-3 rounded text-ink-800 leading-relaxed">
          {data.receivedForDescription || 'Payment received for agency consulting and digital services.'}
        </div>
      </div>

      {/* Thank you card */}
      <div className="mb-8 text-xs bg-parchment-50 border border-parchment-200 p-4 rounded text-center">
        <p className="text-ink-700 italic font-serif text-sm mb-1">
          &quot;{data.thankYouMessage || 'Thank you for your prompt payment. We value your partnership.'}&quot;
        </p>
      </div>

      {/* Authorized Signatures */}
      <div className="border-t border-parchment-300 pt-6 keep-together">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="text-xs text-ink-500">
            <div>Receipt generated electronically and verified on behalf of:</div>
            <div className="font-semibold text-ink-800 mt-0.5">{agency.name}</div>
          </div>

          {data.agencySigners?.mode === 'dual' ? (
            <div className="flex items-center gap-6">
              {/* Partner 1 */}
              <div className="text-right border-t border-parchment-300 pt-2 min-w-[140px]">
                <div className="h-10 flex items-end justify-end mb-1">
                  {data.agencySigners.signer1Image || agency.primarySigner?.signatureImage ? (
                    <img
                      src={data.agencySigners.signer1Image || agency.primarySigner.signatureImage}
                      alt="Signatory 1"
                      className="max-h-9 max-w-[130px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-base text-ink-900">
                      {data.agencySigners.signer1Name || agency.primarySigner?.name}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-ink-900">
                  {data.agencySigners.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                </div>
                <div className="text-[10px] text-ink-500">
                  {data.agencySigners.signer1Title || 'Senior Managing Partner'}
                </div>
              </div>

              {/* Partner 2 */}
              <div className="text-right border-t border-parchment-300 pt-2 min-w-[140px]">
                <div className="h-10 flex items-end justify-end mb-1">
                  {data.agencySigners.signer2Image ? (
                    <img
                      src={data.agencySigners.signer2Image}
                      alt="Signatory 2"
                      className="max-h-9 max-w-[130px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-base text-ink-900">
                      {data.agencySigners.signer2Name || 'Shayan Das'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-ink-900">
                  {data.agencySigners.signer2Name || 'Shayan Das'}
                </div>
                <div className="text-[10px] text-ink-500">
                  {data.agencySigners.signer2Title || 'Senior Managing Partner'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-right w-64 border-t border-parchment-300 pt-2">
              <div className="h-10 flex items-end justify-end mb-1">
                {data.agencySigners?.signer1Image || agency.primarySigner?.signatureImage ? (
                  <img
                    src={data.agencySigners?.signer1Image || agency.primarySigner.signatureImage}
                    alt="Authorized Signature"
                    className="max-h-9 max-w-[160px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-base text-ink-900">
                    {data.agencySigners?.signer1Name || agency.primarySigner?.signatureText || agency.primarySigner?.name}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-ink-900">
                {data.agencySigners?.signer1Name || agency.primarySigner?.name}
              </div>
              <div className="text-[10px] text-ink-500">
                {data.agencySigners?.signer1Title || agency.primarySigner?.title}
              </div>
            </div>
          )}
        </div>
      </div>

      <DocumentFooter 
        agency={agency} 
        confidentialNotice="Official Payment Acknowledgment & Settlement Record"
      />
    </div>
  );
};

