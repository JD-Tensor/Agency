import React from 'react';
import { QuotationData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentFooter } from './DocumentHeader';
import { Calendar, Clock, Check, PlusCircle } from 'lucide-react';

interface QuotationTemplateProps {
  data: QuotationData;
  agency: AgencyProfile;
  docNumber?: string;
}

export const QuotationTemplate: React.FC<QuotationTemplateProps> = ({ data, agency, docNumber }) => {
  const currencySymbol = data.currencySymbol || agency.currencySymbol || '$';
  const displayDocNumber = data.quotationNumber || docNumber || 'QT-2026-001';

  // Calculations
  const subtotal = (data.lineItems || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const addonsTotal = (data.addonOptions || []).filter(a => a.selected).reduce((sum, a) => sum + a.price, 0);
  const baseTotal = subtotal + addonsTotal;
  const discountAmount = data.discountPercent ? (baseTotal * data.discountPercent) / 100 : 0;
  const taxableTotal = baseTotal - discountAmount;
  const taxAmount = data.taxPercent ? (taxableTotal * data.taxPercent) / 100 : 0;
  const grandTotal = taxableTotal + taxAmount;

  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      {/* Top Header & Meta */}
      <div className="border-b border-parchment-300 pb-6 mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-3 w-3 rounded-full bg-clay-600 inline-block"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-ink-700">
              {agency.name}
            </span>
            <span className="text-[10px] uppercase font-semibold text-clay-700 bg-clay-50 px-2 py-0.5 rounded border border-clay-200">
              Commercial Quotation
            </span>
          </div>
          <div className="text-xs text-ink-500">{agency.address}</div>
          <div className="text-xs text-ink-500">{agency.cityStateZip}, {agency.country}</div>
          <div className="text-xs text-ink-500">Email: {agency.email} • Tel: {agency.phone}</div>
          {agency.taxId && (
            <div className="text-xs text-ink-500 mt-1">Tax / VAT ID: <span className="font-mono text-ink-700">{agency.taxId}</span></div>
          )}
        </div>

        <div className="text-right">
          <h1 className="text-3xl font-serif text-ink-950 font-normal tracking-tight mb-1">
            QUOTATION
          </h1>
          <div className="text-sm font-mono font-semibold text-clay-700">
            {displayDocNumber}
          </div>
          <div className="text-xs text-ink-600 mt-2 space-y-0.5">
            <div>Issue Date: <span className="font-medium text-ink-900">{data.issueDate || '—'}</span></div>
            <div className="text-clay-800 font-medium">
              Valid Until: <span className="font-semibold text-clay-900 bg-clay-50 px-1.5 py-0.5 rounded border border-clay-200">{data.validUntil || '30 Days from Issue'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipient & Project Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Prepared For */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4">
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1.5">
            Prepared For (Client)
          </div>
          <div className="font-serif font-semibold text-ink-950 text-base">
            {data.clientCompany || data.clientName || 'Client Organization'}
          </div>
          {data.clientName && data.clientCompany && (
            <div className="text-xs text-ink-700 font-medium">Attn: {data.clientName}</div>
          )}
          {data.clientAddress && (
            <div className="text-xs text-ink-500 whitespace-pre-line mt-1">{data.clientAddress}</div>
          )}
          <div className="text-xs text-ink-500 mt-1 space-y-0.5">
            {data.clientEmail && <div>Email: <span className="text-ink-800 font-mono">{data.clientEmail}</span></div>}
            {data.clientPhone && <div>Phone: <span className="text-ink-800 font-mono">{data.clientPhone}</span></div>}
          </div>
        </div>

        {/* Project Scope & Timeline Details */}
        <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Project Engagement</span>
              {data.timelineEstimate && (
                <span className="inline-flex items-center gap-1 text-ink-600 bg-white px-2 py-0.5 rounded border border-parchment-200 font-normal">
                  <Clock className="w-3 h-3 text-clay-600" />
                  {data.timelineEstimate}
                </span>
              )}
            </div>
            <div className="font-semibold text-ink-950 text-sm">
              {data.projectTitle || 'Digital Engineering & Design Engagement'}
            </div>
            <p className="text-xs text-ink-600 mt-1 line-clamp-3 leading-relaxed">
              {data.projectScopeOverview || 'Comprehensive scope estimate for scheduled engineering, architecture, and design sprint deliverables.'}
            </p>
          </div>
          <div className="text-[11px] text-ink-500 mt-2 pt-2 border-t border-parchment-200 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-clay-600" />
            <span>Target Kickoff: Upon formal acceptance and initial deposit settlement</span>
          </div>
        </div>
      </div>

      {/* Itemized Deliverables Table */}
      <div className="mb-6">
        <div className="text-xs font-serif font-semibold text-ink-900 mb-2 uppercase tracking-wide">
          1. Scope Deliverables & Itemized Breakdown
        </div>
        <table className="w-full text-xs border border-parchment-200 rounded print:overflow-visible">
          <thead className="bg-parchment-100 text-ink-700 font-semibold text-[10px] uppercase">
            <tr>
              <th className="text-center p-2.5 border-b border-parchment-200 w-10">#</th>
              <th className="text-left p-2.5 border-b border-parchment-200">Deliverable / Scope Component</th>
              <th className="text-center p-2.5 border-b border-parchment-200 w-20">Unit</th>
              <th className="text-right p-2.5 border-b border-parchment-200 w-16">Qty</th>
              <th className="text-right p-2.5 border-b border-parchment-200 w-28">Unit Rate</th>
              <th className="text-right p-2.5 border-b border-parchment-200 w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-parchment-200">
            {data.lineItems && data.lineItems.length > 0 ? (
              data.lineItems.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-parchment-50/50">
                  <td className="p-2.5 text-center text-ink-400 font-mono text-[11px]">{idx + 1}</td>
                  <td className="p-2.5">
                    <div className="font-semibold text-ink-950">{item.title}</div>
                    {item.description && (
                      <div className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">{item.description}</div>
                    )}
                  </td>
                  <td className="p-2.5 text-center text-ink-600 font-mono text-[11px]">{item.unit || 'Milestone'}</td>
                  <td className="p-2.5 text-right text-ink-700 font-mono">{item.quantity}</td>
                  <td className="p-2.5 text-right text-ink-700 font-mono">
                    {currencySymbol}{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2.5 text-right text-ink-950 font-semibold font-mono">
                    {currencySymbol}{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-ink-400 italic">No line items specified</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Optional Add-on Packages (if any present) */}
      {data.addonOptions && data.addonOptions.length > 0 && (
        <div className="mb-6 keep-together">
          <div className="text-xs font-serif font-semibold text-ink-900 mb-2 uppercase tracking-wide flex items-center justify-between">
            <span>2. Optional Add-on Modules & SLA Upgrades</span>
            <span className="text-[10px] font-sans font-normal text-ink-500">Client may elect to add during acceptance</span>
          </div>
          <div className="space-y-2 border border-parchment-200 rounded-lg p-3 bg-parchment-50/40">
            {data.addonOptions.map((addon, idx) => (
              <div key={addon.id || idx} className="flex items-start justify-between gap-4 p-2 bg-white rounded border border-parchment-200 text-xs">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {addon.selected ? (
                      <div className="w-4 h-4 rounded bg-clay-600 text-white flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded border border-parchment-300 bg-parchment-50 flex items-center justify-center text-[10px]">
                        <PlusCircle className="w-3 h-3 text-ink-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-ink-950 flex items-center gap-2">
                      <span>{addon.title}</span>
                      {addon.selected ? (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                          Selected in Estimate
                        </span>
                      ) : (
                        <span className="text-[9px] bg-parchment-100 text-ink-500 px-1.5 py-0.2 rounded">
                          Optional Upgrade
                        </span>
                      )}
                    </div>
                    {addon.description && (
                      <p className="text-[11px] text-ink-500 mt-0.5">{addon.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right font-mono font-semibold text-ink-900 flex-shrink-0">
                  +{currencySymbol}{addon.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commercial Terms & Calculation Summary Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6 keep-together">
        {/* Left: Commercial Payment Schedule & Bank Instructions */}
        <div className="md:col-span-7 space-y-3">
          <div className="text-xs font-serif font-semibold text-ink-900 uppercase tracking-wide">
            3. Commercial Terms & Payment Schedule
          </div>
          <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-3 text-xs text-ink-700 leading-relaxed">
            <div className="font-medium text-ink-900 mb-1">Payment Schedule:</div>
            <div>{data.paymentTerms || '50% upfront deposit upon contract signing; 50% upon final acceptance and handover.'}</div>
          </div>

          {agency.bankDetails && (
            <div className="bg-white border border-parchment-200 rounded-lg p-3 text-[11px] text-ink-600">
              <div className="font-semibold text-ink-900 mb-1">Official Remittance Coordinates:</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px]">
                <div>Bank: <span className="text-ink-800">{agency.bankDetails.bankName}</span></div>
                <div>Account: <span className="text-ink-800">{agency.bankDetails.accountNumber}</span></div>
                <div>Routing/SWIFT: <span className="text-ink-800">{agency.bankDetails.routingOrSwift}</span></div>
                {agency.bankDetails.iban && <div>IBAN: <span className="text-ink-800">{agency.bankDetails.iban}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* Right: Total Investment Summary */}
        <div className="md:col-span-5">
          <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 font-mono text-xs space-y-2">
            <div className="flex justify-between text-ink-600">
              <span className="font-sans">Scope Subtotal:</span>
              <span>{currencySymbol}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-ink-600">
                <span className="font-sans">Add-on Modules:</span>
                <span>+{currencySymbol}{addonsTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-forest-700 font-medium">
                <span className="font-sans">Discount ({data.discountPercent}%):</span>
                <span>-{currencySymbol}{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-ink-600">
                <span className="font-sans">Estimated Tax ({data.taxPercent}%):</span>
                <span>+{currencySymbol}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="border-t border-parchment-300 pt-2 flex justify-between items-baseline">
              <span className="font-sans font-bold text-ink-950 text-xs uppercase tracking-wide">
                Total Estimate:
              </span>
              <span className="font-bold text-lg text-clay-700">
                {currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[10px] text-ink-400 text-right font-sans italic">
              All quotes in {data.currency || agency.defaultCurrency || 'USD'}
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions & Legal Caveats */}
      {data.termsAndAssumptions && data.termsAndAssumptions.length > 0 && (
        <div className="mb-6 bg-parchment-50/60 border border-parchment-200 rounded-lg p-3.5 keep-together">
          <div className="text-[11px] font-semibold text-ink-900 uppercase tracking-wide mb-1.5">
            4. Assumptions & Engagement Conditions
          </div>
          <ul className="text-xs text-ink-600 space-y-1 list-disc pl-4 leading-relaxed">
            {data.termsAndAssumptions.map((term, idx) => (
              <li key={idx}>{term}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Dual Authorization & Sign-off Block */}
      <div className="border-t border-parchment-300 pt-6 mt-6 keep-together">
        <div className="text-xs font-serif font-semibold text-ink-950 uppercase tracking-wide mb-4">
          5. Quotation Authorization & Acceptance Execution
        </div>
        <p className="text-xs text-ink-600 mb-5 leading-relaxed">
          By signing below or issuing a corresponding Purchase Order referencing this Quotation ({displayDocNumber}), the Client authorizes {agency.name} to schedule resources and commence sprint deliverables as detailed herein.
        </p>

        {data.agencySigners?.mode === 'dual' ? (
          /* Dual Partner Signatures + Client Signatory */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Partner 1 */}
            <div className="border border-parchment-200 rounded-lg p-3.5 bg-white shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-400 tracking-wider mb-1.5">
                  Authorized Senior Managing Partner
                </div>
                <div className="h-11 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                  {data.agencySigners.signer1Image || agency.primarySigner?.signatureImage ? (
                    <img
                      src={data.agencySigners.signer1Image || agency.primarySigner.signatureImage}
                      alt="Signatory 1"
                      className="max-h-10 max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-base text-clay-800 font-medium">
                      {data.agencySigners.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-ink-900">
                  {data.agencySigners.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                </div>
                <div className="text-[10.5px] text-ink-500">
                  {data.agencySigners.signer1Title || 'Senior Managing Partner'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 font-mono mt-2">Date: {data.issueDate}</div>
            </div>

            {/* Partner 2 */}
            <div className="border border-parchment-200 rounded-lg p-3.5 bg-white shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-400 tracking-wider mb-1.5">
                  Authorized Senior Managing Partner
                </div>
                <div className="h-11 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                  {data.agencySigners.signer2Image ? (
                    <img
                      src={data.agencySigners.signer2Image}
                      alt="Signatory 2"
                      className="max-h-10 max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-base text-clay-800 font-medium">
                      {data.agencySigners.signer2Name || 'Shayan Das'}
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-ink-900">
                  {data.agencySigners.signer2Name || 'Shayan Das'}
                </div>
                <div className="text-[10.5px] text-ink-500">
                  {data.agencySigners.signer2Title || 'Senior Managing Partner'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 font-mono mt-2">Date: {data.issueDate}</div>
            </div>

            {/* Client Signatory */}
            <div className="border border-parchment-200 rounded-lg p-3.5 bg-white shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-400 tracking-wider mb-1.5 truncate">
                  Accepted For {data.clientCompany || 'Client'}
                </div>
                <div className="h-11 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                  <span className="text-[10px] text-ink-400 font-sans italic">Signature:</span>
                </div>
                <div className="text-xs font-semibold text-ink-900">
                  {data.clientSignerName || data.clientName || 'Authorized Client Representative'}
                </div>
                <div className="text-[10.5px] text-ink-500">
                  {data.clientSignerTitle || 'Title / Role'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 font-mono mt-2">Date: ____________________</div>
              {data.acceptanceNotes && (
                <div className="text-[9.5px] text-clay-700 bg-clay-50 p-1 rounded mt-1.5 border border-clay-200 truncate">
                  Ref: {data.acceptanceNotes}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Single Signatory + Client Signatory */
          <div className="grid grid-cols-2 gap-8">
            {/* Agency Signer */}
            <div className="border border-parchment-200 rounded-lg p-4 bg-white">
              <div className="text-[10px] uppercase font-semibold text-ink-400 tracking-wider mb-2">
                Authorized For {agency.name}
              </div>
              <div className="h-12 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                {data.agencySigners?.signer1Image || agency.primarySigner?.signatureImage ? (
                  <img
                    src={data.agencySigners?.signer1Image || agency.primarySigner.signatureImage}
                    alt="Authorized Signature"
                    className="max-h-11 max-w-[180px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-lg text-clay-800 font-medium">
                    {data.agencySigners?.signer1Name || agency.primarySigner?.signatureText || agency.primarySigner?.name || 'Authorized Partner'}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-ink-900">
                {data.agencySigners?.signer1Name || agency.primarySigner?.name}
              </div>
              <div className="text-[11px] text-ink-500">
                {data.agencySigners?.signer1Title || agency.primarySigner?.title}
              </div>
              <div className="text-[11px] text-ink-400 font-mono mt-1">Date: {data.issueDate}</div>
            </div>

            {/* Client Signer - Signature stays EMPTY for client signing */}
            <div className="border border-parchment-200 rounded-lg p-4 bg-white">
              <div className="text-[10px] uppercase font-semibold text-ink-400 tracking-wider mb-2">
                Accepted & Authorized For {data.clientCompany || 'Client'}
              </div>
              <div className="h-12 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                <span className="text-[10px] text-ink-400 font-sans italic">Signature:</span>
              </div>
              <div className="text-xs font-semibold text-ink-900">{data.clientSignerName || data.clientName || 'Authorized Client Representative'}</div>
              <div className="text-[11px] text-ink-500">{data.clientSignerTitle || 'Title / Role'}</div>
              <div className="text-[11px] text-ink-400 font-mono mt-1">
                Date: ________________________
              </div>
              {data.acceptanceNotes && (
                <div className="text-[10px] text-clay-700 bg-clay-50 p-1.5 rounded mt-2 border border-clay-200">
                  Ref: {data.acceptanceNotes}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <DocumentFooter agency={agency} confidentialNotice="Commercial Quotation — Strictly Confidential & Valid for 30 Days" />
    </div>
  );
};

