import React from 'react';
import { OffboardingData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentHeader, DocumentFooter } from './DocumentHeader';

interface OffboardingTemplateProps {
  data: OffboardingData;
  agency: AgencyProfile;
  docNumber?: string;
}

export const OffboardingTemplate: React.FC<OffboardingTemplateProps> = ({
  data,
  agency,
  docNumber = 'OFF-2026-001'
}) => {
  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      <DocumentHeader 
        agency={agency}
        docTitle="Project Offboarding & Handover Report"
        docNumber={docNumber}
        docDate={data.projectCompletedDate || new Date().toISOString().split('T')[0]}
        docTypeBadge="Project Handover"
      />

      {/* Client & Project Card */}
      <div className="grid grid-cols-2 gap-4 bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-6 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Client Organization
          </div>
          <div className="font-semibold text-ink-950 text-sm">{data.clientCompany || data.clientName}</div>
          <div className="text-ink-700">Client Approver: {data.clientName}</div>
          <div className="text-ink-500">{data.clientEmail}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Project Completion
          </div>
          <div className="text-ink-800">
            <span className="font-medium text-ink-600">Completion Date:</span> {data.projectCompletedDate}
          </div>
          <div className="text-ink-800 mt-0.5">
            <span className="font-medium text-ink-600">Project:</span> {data.projectTitle}
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-forest-700"></span>
          Project Wrap-Up Summary
        </h2>
        <div className="text-xs text-ink-800 leading-relaxed bg-white p-3 rounded border border-parchment-200">
          {data.executiveSummary}
        </div>
      </div>

      {/* Deliverables Delivered Audit */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2">
          Verified Deliverables & Artifacts Handover
        </h2>
        <div className="border border-parchment-200 rounded p-3 bg-parchment-50/40 text-xs space-y-1.5">
          {data.deliverablesDelivered && data.deliverablesDelivered.length > 0 ? (
            data.deliverablesDelivered.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-forest-700 font-bold">✓</span>
                <span className="text-ink-800">{item}</span>
              </div>
            ))
          ) : (
            <div className="text-ink-400 italic">No deliverables listed.</div>
          )}
        </div>
      </div>

      {/* Assets & Credentials Handover Table */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2">
          Account, Repository & Asset Transference
        </h2>
        <table className="w-full text-xs border border-parchment-200 rounded print:overflow-visible">
          <thead className="bg-parchment-100 text-ink-600 font-semibold text-[10px] uppercase">
            <tr>
              <th className="text-left p-2 border-b border-parchment-200">Asset / Service</th>
              <th className="text-left p-2 border-b border-parchment-200">Location / URL</th>
              <th className="text-left p-2 border-b border-parchment-200 w-28">Status</th>
              <th className="text-left p-2 border-b border-parchment-200">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-parchment-200">
            {data.assetsAndCredentialsHandover && data.assetsAndCredentialsHandover.length > 0 ? (
              data.assetsAndCredentialsHandover.map((asset, idx) => (
                <tr key={idx} className="hover:bg-parchment-50/50">
                  <td className="p-2 text-ink-900 font-medium">{asset.item}</td>
                  <td className="p-2 text-ink-600 font-mono text-[11px]">{asset.locationOrUrl}</td>
                  <td className="p-2">
                    <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {asset.accessTransferred ? '✓ Transferred' : 'In Progress'}
                    </span>
                  </td>
                  <td className="p-2 text-ink-500 text-[11px]">{asset.notes || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-2 text-center text-ink-400 italic">No assets listed</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Warranty & Maintenance */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-xs keep-together">
        <div className="border border-parchment-200 p-3 rounded bg-white">
          <div className="text-[10px] uppercase font-semibold text-ink-600 tracking-wider mb-1">
            Warranty & Post-Launch Support
          </div>
          <p className="text-ink-800 leading-relaxed text-[11px]">{data.warrantyAndSupportPeriod}</p>
        </div>

        <div className="border border-parchment-200 p-3 rounded bg-white">
          <div className="text-[10px] uppercase font-semibold text-ink-600 tracking-wider mb-1">
            Infrastructure & Maintenance Notes
          </div>
          <p className="text-ink-800 leading-relaxed text-[11px]">{data.hostingAndMaintenanceNotes}</p>
        </div>
      </div>

      {/* Post Launch Recommendations */}
      {data.postLaunchRecommendations && data.postLaunchRecommendations.length > 0 && (
        <div className="mb-6 text-xs bg-parchment-50 p-3 rounded border border-parchment-200 keep-together">
          <div className="text-[10px] uppercase font-semibold text-clay-700 tracking-wider mb-1.5">
            Recommended Next Horizons
          </div>
          <ul className="space-y-1 text-ink-800">
            {data.postLaunchRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-clay-600">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Acceptance Signoff Block */}
      <div className="border-t border-parchment-300 pt-5 mt-6 keep-together">
        <div className="text-xs font-semibold text-ink-800 mb-1 uppercase tracking-wider">
          Formal Acceptance & Project Release
        </div>
        <p className="text-[11px] text-ink-600 mb-4 leading-relaxed">
          {data.formalSignoffStatement}
        </p>
        {data.agencySigners?.mode === 'dual' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Partner 1 */}
            <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1">
                  Delivered by Senior Managing Partner
                </div>
                <div className="h-10 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                  {data.agencySigners.signer1Image || agency.primarySigner?.signatureImage ? (
                    <img
                      src={data.agencySigners.signer1Image || agency.primarySigner.signatureImage}
                      alt="Signatory 1"
                      className="max-h-9 max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="font-serif italic text-base text-ink-900">
                      {data.agencySigners.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                    </span>
                  )}
                </div>
                <div className="font-semibold text-ink-900">
                  {data.agencySigners.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                </div>
                <div className="text-[10px] text-ink-500">
                  {data.agencySigners.signer1Title || 'Senior Managing Partner'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: {data.projectCompletedDate}</div>
            </div>

            {/* Partner 2 */}
            <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1">
                  Delivered by Senior Managing Partner
                </div>
                <div className="h-10 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
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
                <div className="font-semibold text-ink-900">
                  {data.agencySigners.signer2Name || 'Shayan Das'}
                </div>
                <div className="text-[10px] text-ink-500">
                  {data.agencySigners.signer2Title || 'Senior Managing Partner'}
                </div>
              </div>
              <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: {data.projectCompletedDate}</div>
            </div>

            {/* Client Signatory */}
            <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
              <div>
                <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1 truncate">
                  Accepted by {data.clientCompany || data.clientName}
                </div>
                <div className="h-10 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                  <span className="text-[10px] text-ink-400 font-sans italic">Signature:</span>
                </div>
                <div className="font-semibold text-ink-900">{data.clientApproverName || data.clientName}</div>
                <div className="text-[10px] text-ink-500">Authorized Client Signatory</div>
              </div>
              <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: ________________________</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div className="border border-parchment-200 p-3 rounded bg-parchment-50/50">
              <div className="text-[10px] uppercase font-semibold text-ink-500 mb-1">Delivered by {agency.name}</div>
              <div className="h-10 border-b border-parchment-300 flex items-end pb-1">
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
              <div className="font-semibold text-ink-900 mt-1">
                {data.agencySigners?.signer1Name || agency.primarySigner?.name}
              </div>
              <div className="text-[10px] text-ink-500">
                {data.agencySigners?.signer1Title || agency.primarySigner?.title}
              </div>
              <div className="text-[10px] text-ink-400 mt-0.5">Date: {data.projectCompletedDate}</div>
            </div>

            <div className="border border-parchment-200 p-3 rounded bg-parchment-50/50">
              <div className="text-[10px] uppercase font-semibold text-ink-500 mb-1">Accepted by {data.clientCompany || data.clientName}</div>
              <div className="h-10 border-b border-parchment-300 flex items-end pb-1">
                <span className="text-[10px] text-ink-400 font-sans italic">Signature:</span>
              </div>
              <div className="font-semibold text-ink-900 mt-1">{data.clientApproverName || data.clientName}</div>
              <div className="text-[10px] text-ink-500">Authorized Client Signatory</div>
              <div className="text-[10px] text-ink-400 mt-0.5">Date: ________________________</div>
            </div>
          </div>
        )}
      </div>

      <DocumentFooter agency={agency} />
    </div>
  );
};

