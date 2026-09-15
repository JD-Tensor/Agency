import React from 'react';
import { NdaData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentHeader, DocumentFooter } from './DocumentHeader';

interface NdaTemplateProps {
  data: NdaData;
  agency: AgencyProfile;
  docNumber?: string;
}

export const NdaTemplate: React.FC<NdaTemplateProps> = ({
  data,
  agency,
  docNumber = 'NDA-2026-001'
}) => {
  const isMutual = data.agreementType === 'mutual';

  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      <DocumentHeader 
        agency={agency}
        docTitle={`${isMutual ? 'Mutual' : 'Standard'} Non-Disclosure Agreement`}
        docNumber={docNumber}
        docDate={data.agreementDate || new Date().toISOString().split('T')[0]}
        docTypeBadge="Legal Agreement"
      />

      {/* Preamble / Parties */}
      <div className="text-xs text-ink-800 leading-relaxed mb-6 bg-parchment-50 p-3.5 rounded border border-parchment-200">
        <p>
          This Non-Disclosure Agreement (&quot;<strong>Agreement</strong>&quot;) is entered into as of{' '}
          <strong>{data.agreementDate}</strong> (&quot;<strong>Effective Date</strong>&quot;), by and between:
        </p>
        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-parchment-200">
          <div>
            <div className="text-[10px] uppercase font-semibold text-ink-500">Party A</div>
            <div className="font-semibold text-ink-900">{data.disclosingPartyName}</div>
            <div className="text-ink-600 whitespace-pre-line text-[11px]">{data.disclosingPartyAddress}</div>
            <div className="text-ink-500 text-[10px] mt-0.5">Rep: {data.disclosingPartyRepresentative}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-ink-500">Party B</div>
            <div className="font-semibold text-ink-900">{data.receivingPartyName}</div>
            <div className="text-ink-600 whitespace-pre-line text-[11px]">{data.receivingPartyAddress}</div>
            <div className="text-ink-500 text-[10px] mt-0.5">Rep: {data.receivingPartyRepresentative}</div>
          </div>
        </div>
      </div>

      {/* Purpose */}
      <div className="mb-4 text-xs">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
          1. Purpose of Disclosure
        </h2>
        <p className="text-ink-800 leading-relaxed bg-white border border-parchment-200 p-2.5 rounded">
          {data.purpose}
        </p>
      </div>

      {/* Scope of Confidential Info */}
      <div className="mb-4 text-xs">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
          2. Definition of Confidential Information
        </h2>
        <p className="text-ink-800 leading-relaxed bg-white border border-parchment-200 p-2.5 rounded">
          {data.confidentialInfoScope}
        </p>
      </div>

      {/* Obligations & Standard of Care */}
      <div className="mb-4 text-xs">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
          3. Obligations & Standard of Care
        </h2>
        <div className="text-ink-800 leading-relaxed bg-white border border-parchment-200 p-2.5 rounded space-y-1.5">
          <p>
            The Receiving Party agrees to hold and maintain all Confidential Information in strictest confidence 
            for the sole and exclusive benefit of the Disclosing Party.
          </p>
          <p>
            The Receiving Party shall exercise at least the same degree of care as it uses to protect its own 
            confidential information of a similar nature, but in no event less than a reasonable degree of care.
          </p>
        </div>
      </div>

      {/* Term & Non-Solicitation */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div className="border border-parchment-200 p-2.5 rounded bg-white">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
            4. Term & Duration
          </h2>
          <p className="text-ink-800 leading-relaxed">
            The confidentiality obligations under this Agreement shall survive for a duration of{' '}
            <strong className="text-clay-700">{data.durationYears} years</strong> from the Effective Date.
          </p>
        </div>

        <div className="border border-parchment-200 p-2.5 rounded bg-white">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
            5. Governing Law & Jurisdiction
          </h2>
          <p className="text-ink-800 leading-relaxed">
            This Agreement shall be governed and construed in accordance with the laws of the State of{' '}
            <strong>{data.governingLawState}</strong>, {data.governingCountry}, without regard to conflict of law principles.
          </p>
        </div>
      </div>

      {/* Remedies Clause */}
      <div className="mb-4 text-xs">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-700 mb-1">
          6. Remedies & Injunctive Relief
        </h2>
        <p className="text-ink-700 text-[11px] leading-relaxed bg-parchment-50 p-2.5 rounded border border-parchment-200">
          {data.remediesClause}
        </p>
      </div>

      {/* Signatures */}
      <div className="border-t border-parchment-300 pt-5 mt-6 keep-together break-inside-avoid">
        {(() => {
          const isDisclosingPartyAgency = data.disclosingPartyName?.toLowerCase().includes(agency.name.toLowerCase()) ||
            (agency.name && agency.name.toLowerCase().includes(data.disclosingPartyName?.toLowerCase() || '___'));

          const agencyPartyName = isDisclosingPartyAgency ? data.disclosingPartyName : (data.receivingPartyName || agency.name);
          const clientPartyName = isDisclosingPartyAgency ? data.receivingPartyName : data.disclosingPartyName;
          const clientPartyRep = isDisclosingPartyAgency ? data.receivingPartyRepresentative : data.disclosingPartyRepresentative;

          return (
            <>
              <div className="text-xs font-semibold text-ink-800 mb-3 uppercase tracking-wider flex items-center justify-between">
                <span>IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.</span>
                <span className="text-[10px] text-ink-400 font-mono">
                  {data.agencySigners?.mode === 'dual' ? 'Dual Partner Execution' : 'Authorized Execution'}
                </span>
              </div>

              {data.agencySigners?.mode === 'dual' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Agency Partner 1 */}
                  <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
                    <div>
                      <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1 truncate">
                        For {agencyPartyName} (Partner 1)
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
                      <div className="text-[10.5px] text-ink-500">
                        {data.agencySigners.signer1Title || 'Senior Managing Partner'}
                      </div>
                    </div>
                    <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: {data.agreementDate}</div>
                  </div>

                  {/* Agency Partner 2 */}
                  <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
                    <div>
                      <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1 truncate">
                        For {agencyPartyName} (Partner 2)
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
                      <div className="text-[10.5px] text-ink-500">
                        {data.agencySigners.signer2Title || 'Senior Managing Partner'}
                      </div>
                    </div>
                    <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: {data.agreementDate}</div>
                  </div>

                  {/* Client Signatory */}
                  <div className="border border-parchment-200 p-3 rounded-lg bg-parchment-50/50 flex flex-col justify-between">
                    <div>
                      <div className="text-[9.5px] uppercase font-semibold text-ink-500 mb-1 truncate">
                        For {clientPartyName}
                      </div>
                      <div className="h-10 border-b border-parchment-300 flex items-end pb-1 mb-1.5">
                        <span className="text-[10px] text-ink-400 font-sans italic">Signature:</span>
                      </div>
                      <div className="font-semibold text-ink-900">
                        {clientPartyRep || 'Authorized Representative'}
                      </div>
                      <div className="text-[10.5px] text-ink-500">Authorized Client Signatory</div>
                    </div>
                    <div className="text-[10px] text-ink-400 mt-2 font-mono">Date: ________________________</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8 text-xs">
                  {/* Agency Signer */}
                  <div className="border border-parchment-200 p-3 rounded bg-parchment-50/50">
                    <div className="text-[10px] uppercase font-semibold text-ink-500 mb-1">
                      For {agencyPartyName}
                    </div>
                    <div className="h-10 border-b border-parchment-300 flex items-end pb-1">
                      {data.agencySigners?.signer1Image || agency.primarySigner?.signatureImage ? (
                        <img
                          src={data.agencySigners?.signer1Image || agency.primarySigner.signatureImage}
                          alt="Authorized Signature"
                          className="max-h-9 max-w-[160px] object-contain"
                        />
                      ) : (
                        <span className="font-serif italic text-base text-ink-900">
                          {data.agencySigners?.signer1Name || agency.primarySigner?.signatureText || agency.primarySigner?.name || 'Subhadip Jana'}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-ink-900 mt-1">
                      {data.agencySigners?.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                    </div>
                    <div className="text-[10px] text-ink-500 mt-0.5">
                      {data.agencySigners?.signer1Title || agency.primarySigner?.title || 'Senior Managing Partner'} • Date: {data.agreementDate}
                    </div>
                  </div>

                  {/* Client Signer */}
                  <div className="border border-parchment-200 p-3 rounded bg-parchment-50/50">
                    <div className="text-[10px] uppercase font-semibold text-ink-500 mb-1">
                      For {clientPartyName}
                    </div>
                    <div className="h-10 border-b border-parchment-300 flex items-end pb-1">
                      <span className="text-[10px] text-ink-400 font-sans italic">Signature:</span>
                    </div>
                    <div className="font-semibold text-ink-900 mt-1">
                      {clientPartyRep || 'Authorized Representative'}
                    </div>
                    <div className="text-[10px] text-ink-500 mt-0.5">
                      Authorized Client Signatory • Date: ________________________
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      <DocumentFooter agency={agency} />
    </div>
  );
};

