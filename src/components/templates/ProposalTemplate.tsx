import React from 'react';
import { ProposalData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentHeader, DocumentFooter } from './DocumentHeader';

interface ProposalTemplateProps {
  data: ProposalData;
  agency: AgencyProfile;
}

export const ProposalTemplate: React.FC<ProposalTemplateProps> = ({ data, agency }) => {
  const currencySymbol = data.currencySymbol || agency.currencySymbol || '$';
  const calculateTotal = () => {
    if (data.pricingModel === 'fixed') return data.fixedTotal || 0;
    return (data.milestones || []).reduce((acc, m) => acc + (m.price || 0), 0);
  };

  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      <DocumentHeader 
        agency={agency}
        docTitle={data.projectTitle || 'Client Services Proposal & Scope of Work'}
        docNumber={data.proposalNumber || 'PROP-2026-001'}
        docDate={data.issueDate || new Date().toISOString().split('T')[0]}
        docTypeBadge="Project Proposal & SOW"
      />

      {/* Recipient & Expiry Banner */}
      <div className="grid grid-cols-2 gap-4 bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-6 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Prepared Exclusively For
          </div>
          <div className="font-semibold text-ink-950 text-sm">{data.clientCompany || data.clientName}</div>
          <div className="text-ink-700">Attn: {data.clientName}</div>
          <div className="text-ink-500 whitespace-pre-line">{data.clientAddress}</div>
          <div className="text-ink-500">{data.clientEmail}</div>
        </div>
        <div className="text-right flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
              Proposal Validity
            </div>
            <div className="text-xs text-ink-700">
              Valid until: <span className="font-semibold text-clay-700">{data.validUntil || '14 Days'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-ink-500">Prepared By</div>
            <div className="font-semibold text-ink-800">
              {data.agencySigners?.mode === 'dual'
                ? `${data.agencySigners.signer1Name || 'Subhadip Jana'} & ${data.agencySigners.signer2Name || 'Shayan Das'}`
                : (data.agencySigners?.signer1Name || agency.primarySigner.name)}
            </div>
            <div className="text-[11px] text-ink-500">
              {data.agencySigners?.mode === 'dual'
                ? 'Senior Managing Partners'
                : (data.agencySigners?.signer1Title || agency.primarySigner.title)}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
          1. Executive Summary
        </h2>
        <div className="text-xs text-ink-800 leading-relaxed bg-white p-3 rounded border border-parchment-200">
          {data.executiveSummary || 'No executive summary provided.'}
        </div>
      </div>

      {/* Problem Statement */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
          2. Problem Statement & Strategic Context
        </h2>
        <div className="text-xs text-ink-800 leading-relaxed bg-white p-3 rounded border border-parchment-200">
          {data.problemStatement || 'No problem statement provided.'}
        </div>
      </div>

      {/* Proposed Solution */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
          3. Proposed Technical & Design Solution
        </h2>
        <div className="text-xs text-ink-800 leading-relaxed bg-white p-3 rounded border border-parchment-200">
          {data.proposedSolution || 'No solution provided.'}
        </div>
      </div>

      {/* Milestones & Deliverables */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
          4. Phased Milestones & Scope of Work
        </h2>
        <div className="space-y-3">
          {data.milestones?.map((milestone, idx) => (
            <div key={idx} className="border border-parchment-200 rounded p-3 bg-white">
              <div className="flex justify-between items-start mb-1.5">
                <span className="font-semibold text-xs text-ink-900">{milestone.title}</span>
                <span className="text-[11px] text-clay-700 bg-clay-50 px-2 py-0.5 rounded border border-clay-200 font-mono">
                  {milestone.duration}
                </span>
              </div>
              <ul className="list-disc list-inside text-xs text-ink-600 space-y-0.5 ml-1">
                {milestone.deliverables?.map((d, dIdx) => (
                  <li key={dIdx}>{d}</li>
                ))}
              </ul>
              {milestone.price !== undefined && milestone.price > 0 && (
                <div className="text-right text-xs font-semibold text-ink-800 mt-2 pt-1 border-t border-parchment-100">
                  Phase Investment: {currencySymbol}{milestone.price.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
          5. Investment & Commercial Terms
        </h2>
        
        {data.pricingModel === 'milestone' && (
          <div className="bg-white border border-parchment-200 rounded p-4">
            <div className="flex justify-between items-center text-sm font-semibold text-ink-900 mb-2">
              <span>Total Project Investment (All Milestones)</span>
              <span className="font-mono text-base text-clay-700">
                {currencySymbol}{calculateTotal().toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-ink-500 border-t border-parchment-100 pt-2">
              Payment Schedule: {data.paymentSchedule || 'Standard 50% deposit, remaining on deliverables'}
            </div>
          </div>
        )}

        {data.pricingModel === 'fixed' && (
          <div className="bg-white border border-parchment-200 rounded p-4">
            <div className="flex justify-between items-center text-sm font-semibold text-ink-900 mb-2">
              <span>Fixed Total Engagement Fee</span>
              <span className="font-mono text-base text-clay-700">
                {currencySymbol}{(data.fixedTotal || 0).toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-ink-500 border-t border-parchment-100 pt-2">
              Payment Schedule: {data.paymentSchedule}
            </div>
          </div>
        )}

        {data.pricingModel === 'tiers' && data.pricingTiers && (
          <div className="grid grid-cols-3 gap-3">
            {data.pricingTiers.map((tier, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded border text-xs flex flex-col justify-between ${
                  tier.highlighted ? 'border-clay-600 bg-clay-50/20' : 'border-parchment-200 bg-white'
                }`}
              >
                <div>
                  <div className="font-semibold text-ink-900 mb-1">{tier.name}</div>
                  <div className="font-mono font-bold text-sm text-clay-700 mb-2">
                    {currencySymbol}{tier.price.toLocaleString()}
                  </div>
                  <ul className="space-y-1 text-ink-600 text-[11px]">
                    {tier.features?.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-1">
                        <span className="text-clay-600">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agency Advantages */}
      {data.agencyAdvantages && data.agencyAdvantages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
            6. Why {agency.name}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {data.agencyAdvantages.map((adv, idx) => (
              <div key={idx} className="bg-white border border-parchment-200 p-2.5 rounded text-xs text-ink-700 flex items-start gap-2">
                <span className="text-clay-600 font-bold">✓</span>
                <span>{adv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terms & Conditions */}
      {data.termsAndConditions && (
        <div className="mb-6">
          <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
            7. Terms of Engagement & Intellectual Property
          </h2>
          <div className="text-[11px] text-ink-600 leading-relaxed bg-white p-3 rounded border border-parchment-200 whitespace-pre-line">
            {data.termsAndConditions}
          </div>
        </div>
      )}

      {/* Signature Acceptance Block (Single vs Dual Execution) */}
      <div className="border-t border-parchment-300 pt-6 mt-6 keep-together break-inside-avoid">
        <div className="text-xs font-semibold text-ink-800 mb-4 uppercase tracking-wider flex items-center justify-between">
          <span>Proposal Acceptance & Authorization</span>
          <span className="text-[10px] text-ink-400 font-mono">
            {data.agencySigners?.mode === 'dual' ? 'Dual Partner Execution' : 'Authorized Execution'}
          </span>
        </div>

        {data.agencySigners?.mode === 'dual' ? (
          /* Dual Partner Signatures + Client Signatory */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Partner 1 */}
            <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1">
                  Senior Managing Partner
                </div>
                <div className="h-11 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                  {data.agencySigners.signer1Image || agency.primarySigner?.signatureImage ? (
                    <img
                      src={data.agencySigners.signer1Image || agency.primarySigner.signatureImage}
                      alt="Signatory 1"
                      className="max-h-10 max-w-[140px] object-contain"
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
                <div className="text-[10.5px] text-ink-500">
                  {data.agencySigners.signer1Title || 'Senior Managing Partner'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: {data.issueDate}</div>
            </div>

            {/* Partner 2 */}
            <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1">
                  Senior Managing Partner
                </div>
                <div className="h-11 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                  {data.agencySigners.signer2Image ? (
                    <img
                      src={data.agencySigners.signer2Image}
                      alt="Signatory 2"
                      className="max-h-10 max-w-[140px] object-contain"
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
                <div className="text-[10.5px] text-ink-500">
                  {data.agencySigners.signer2Title || 'Senior Managing Partner'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: {data.issueDate}</div>
            </div>

            {/* Client Signatory */}
            <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1 truncate">
                  Client: {data.clientCompany || data.clientName}
                </div>
                <div className="h-11 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                  <span className="text-[10px] text-ink-400 italic">Signature:</span>
                </div>
                <div className="text-xs font-semibold text-ink-900">
                  {data.clientSignerName || data.clientName || 'Authorized Representative'}
                </div>
                <div className="text-[10.5px] text-ink-500">
                  {data.clientSignerTitle || 'Title / Role'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: ____________________</div>
            </div>
          </div>
        ) : (
          /* Single Agency Signatory + Client Signatory */
          <div className="grid grid-cols-2 gap-8">
            <div className="border border-parchment-200 p-3.5 rounded-lg bg-parchment-50/50">
              <div className="text-[10px] uppercase font-semibold text-ink-500 mb-1">
                Signed on behalf of {agency.name}
              </div>
              <div className="h-11 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                {data.agencySigners?.signer1Image || agency.primarySigner?.signatureImage ? (
                  <img
                    src={data.agencySigners?.signer1Image || agency.primarySigner.signatureImage}
                    alt="Authorized Signature"
                    className="max-h-10 max-w-[160px] object-contain"
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
              <div className="text-[11px] text-ink-500">
                {data.agencySigners?.signer1Title || agency.primarySigner?.title}
              </div>
              <div className="text-[10px] text-ink-400 mt-1 font-mono">Date: {data.issueDate}</div>
            </div>

            <div className="border border-parchment-200 p-3.5 rounded-lg bg-parchment-50/50">
              <div className="text-[10px] uppercase font-semibold text-ink-500 mb-1 truncate">
                Signed on behalf of {data.clientCompany || data.clientName}
              </div>
              <div className="h-11 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                <span className="text-[10px] text-ink-400 italic">Signature:</span>
              </div>
              <div className="text-xs font-semibold text-ink-900">
                {data.clientSignerName || data.clientName}
              </div>
              <div className="text-[11px] text-ink-500">
                {data.clientSignerTitle || 'Authorized Representative'}
              </div>
              <div className="text-[10px] text-ink-400 mt-1 font-mono">Date: ________________________</div>
            </div>
          </div>
        )}
      </div>

      <DocumentFooter agency={agency} />
    </div>
  );
};

