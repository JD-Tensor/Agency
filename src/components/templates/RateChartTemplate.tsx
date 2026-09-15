import React from 'react';
import { RateChartData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentFooter } from './DocumentHeader';
import { Check, AlertCircle, Clock } from 'lucide-react';

interface RateChartTemplateProps {
  data: RateChartData;
  agency: AgencyProfile;
  docNumber?: string;
}

export const RateChartTemplate: React.FC<RateChartTemplateProps> = ({ data, agency, docNumber }) => {
  const currencySymbol = data.currencySymbol || agency.currencySymbol || '$';
  const displayDocNumber = data.rateChartNumber || docNumber || 'RC-2026-001';

  return (
    <div className="a4-sheet p-8 font-sans text-ink-900 bg-white">
      {/* Top Header & Firm Details */}
      <div className="border-b border-parchment-300 pb-5 mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-3 w-3 rounded-full bg-clay-600 inline-block"></span>
            <span className="text-xs font-semibold tracking-wider uppercase text-ink-700">
              {agency.name}
            </span>
            <span className="text-[10px] uppercase font-semibold text-clay-700 bg-clay-50 px-2 py-0.5 rounded border border-clay-200">
              Commercial Rate Card
            </span>
          </div>
          <div className="text-xs text-ink-500">{agency.address}</div>
          <div className="text-xs text-ink-500">{agency.cityStateZip}, {agency.country}</div>
          <div className="text-xs text-ink-500">Email: {agency.email} • Web: {agency.website}</div>
          {agency.taxId && (
            <div className="text-xs text-ink-500 mt-0.5">Tax / Business ID: <span className="font-mono text-ink-700">{agency.taxId}</span></div>
          )}
        </div>

        <div className="text-right">
          <h1 className="text-2xl font-serif text-ink-950 font-normal tracking-tight mb-1">
            RATE CHART
          </h1>
          <div className="text-xs font-mono font-semibold text-clay-700">
            {displayDocNumber}
          </div>
          <div className="text-[11px] text-ink-600 mt-2 space-y-0.5">
            <div>Effective Date: <span className="font-medium text-ink-900">{data.effectiveDate || '—'}</span></div>
            <div className="text-clay-800 font-medium">
              Valid Until: <span className="font-semibold text-clay-900 bg-clay-50 px-1.5 py-0.5 rounded border border-clay-200">{data.validUntil || 'Standard 60 Days'}</span>
            </div>
            <div className="text-ink-500 font-mono text-[10px]">Currency: {data.currency || 'USD'} ({currencySymbol})</div>
          </div>
        </div>
      </div>

      {/* Target & Introductory Notes */}
      <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-3.5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-parchment-200">
          <div>
            <span className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider">Applicable To: </span>
            <span className="text-xs font-semibold text-ink-900">
              {data.preparedFor || 'Standard Commercial Rate Card'}
            </span>
            {data.clientCompany && (
              <span className="text-xs text-ink-600 ml-1">({data.clientCompany})</span>
            )}
          </div>
          <div className="text-[10px] text-clay-800 bg-white px-2 py-0.5 rounded border border-parchment-200 font-medium">
            3-Tier Complexity Matrix: Simple • Medium • Complex
          </div>
        </div>

        {data.introductoryNotes && (
          <p className="text-[11px] text-ink-600 leading-relaxed italic">
            "{data.introductoryNotes}"
          </p>
        )}
      </div>

      {/* Main Multi-Column Rate Chart Table */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-semibold text-ink-950 uppercase tracking-wider">
            1. Services & Complexity Scale Breakdown
          </h3>
          <span className="text-[10px] text-ink-400 font-medium">
            All prices in {data.currency || 'USD'} ({currencySymbol})
          </span>
        </div>

        <div className="border border-parchment-300 rounded-lg overflow-hidden bg-white">
          {/* Table Header Columns */}
          <div className="grid grid-cols-12 bg-parchment-100/80 border-b border-parchment-300 text-[10px] font-semibold uppercase tracking-wider text-ink-700">
            <div className="col-span-3 p-3 border-r border-parchment-300 flex items-center">
              Service / Product Offering
            </div>
            <div className="col-span-3 p-3 border-r border-parchment-300 bg-emerald-50/50">
              <div className="flex items-center justify-between">
                <span className="text-emerald-900">Simple Scale</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-medium">Tier 1</span>
              </div>
            </div>
            <div className="col-span-3 p-3 border-r border-parchment-300 bg-blue-50/50">
              <div className="flex items-center justify-between">
                <span className="text-blue-900">Medium Scale</span>
                <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-mono font-medium">Tier 2</span>
              </div>
            </div>
            <div className="col-span-3 p-3 bg-purple-50/50">
              <div className="flex items-center justify-between">
                <span className="text-purple-900">Complex Scale</span>
                <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-mono font-medium">Tier 3</span>
              </div>
            </div>
          </div>

          {/* Table Rows (Services) */}
          {data.services?.map((service, idx) => (
            <div 
              key={service.id || idx}
              className={`grid grid-cols-12 border-b border-parchment-200 text-ink-900 break-inside-avoid ${
                idx % 2 === 1 ? 'bg-parchment-50/30' : 'bg-white'
              }`}
            >
              {/* Column 1: Service Name & Meta */}
              <div className="col-span-3 p-3 border-r border-parchment-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-4 h-4 rounded-full bg-clay-100 text-clay-800 text-[9px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h4 className="text-xs font-serif font-semibold text-ink-950 leading-snug">
                      {service.serviceName}
                    </h4>
                  </div>
                  {service.category && (
                    <span className="inline-block text-[9px] uppercase tracking-wider font-semibold text-clay-700 bg-clay-50 px-1.5 py-0.5 rounded border border-clay-200 mb-1.5">
                      {service.category}
                    </span>
                  )}
                  {service.description && (
                    <p className="text-[10px] text-ink-500 leading-relaxed mt-1">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Column 2: Simple Scale */}
              <div className="col-span-3 p-3 border-r border-parchment-200 flex flex-col justify-between space-y-2">
                <div>
                  {/* Price & Timeline Badge */}
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded p-1.5 mb-2">
                    <div className="text-xs font-mono font-bold text-emerald-950">
                      {currencySymbol}{service.simple?.price?.toLocaleString() || '0'}
                    </div>
                    {service.simple?.timeline && (
                      <div className="flex items-center gap-1 text-[9px] text-emerald-800 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{service.simple.timeline}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {service.simple?.description && (
                    <p className="text-[10px] text-ink-700 leading-relaxed mb-2 font-medium">
                      {service.simple.description}
                    </p>
                  )}

                  {/* What it includes */}
                  {service.simple?.features && service.simple.features.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider mb-1 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        <span>What It Includes</span>
                      </div>
                      <ul className="space-y-1">
                        {service.simple.features.map((feat, fIdx) => (
                          <li key={fIdx} className="text-[9.5px] text-ink-700 leading-tight flex items-start gap-1">
                            <span className="text-emerald-600 font-bold text-[8px] mt-0.5">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limitations */}
                  {service.simple?.limitations && service.simple.limitations.length > 0 && (
                    <div>
                      <div className="text-[9px] uppercase font-bold text-amber-800 tracking-wider mb-1 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                        <span>Limitations & Out of Scope</span>
                      </div>
                      <ul className="space-y-1">
                        {service.simple.limitations.map((lim, lIdx) => (
                          <li key={lIdx} className="text-[9.5px] text-ink-500 leading-tight flex items-start gap-1">
                            <span className="text-amber-600 font-bold text-[8px] mt-0.5">✕</span>
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Medium Scale */}
              <div className="col-span-3 p-3 border-r border-parchment-200 flex flex-col justify-between space-y-2 bg-blue-50/10">
                <div>
                  {/* Price & Timeline Badge */}
                  <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded p-1.5 mb-2">
                    <div className="text-xs font-mono font-bold text-blue-950">
                      {currencySymbol}{service.medium?.price?.toLocaleString() || '0'}
                    </div>
                    {service.medium?.timeline && (
                      <div className="flex items-center gap-1 text-[9px] text-blue-800 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{service.medium.timeline}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {service.medium?.description && (
                    <p className="text-[10px] text-ink-700 leading-relaxed mb-2 font-medium">
                      {service.medium.description}
                    </p>
                  )}

                  {/* What it includes */}
                  {service.medium?.features && service.medium.features.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[9px] uppercase font-bold text-blue-800 tracking-wider mb-1 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-blue-600" />
                        <span>What It Includes</span>
                      </div>
                      <ul className="space-y-1">
                        {service.medium.features.map((feat, fIdx) => (
                          <li key={fIdx} className="text-[9.5px] text-ink-700 leading-tight flex items-start gap-1">
                            <span className="text-blue-600 font-bold text-[8px] mt-0.5">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limitations */}
                  {service.medium?.limitations && service.medium.limitations.length > 0 && (
                    <div>
                      <div className="text-[9px] uppercase font-bold text-amber-800 tracking-wider mb-1 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                        <span>Limitations & Out of Scope</span>
                      </div>
                      <ul className="space-y-1">
                        {service.medium.limitations.map((lim, lIdx) => (
                          <li key={lIdx} className="text-[9.5px] text-ink-500 leading-tight flex items-start gap-1">
                            <span className="text-amber-600 font-bold text-[8px] mt-0.5">✕</span>
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 4: Complex Scale */}
              <div className="col-span-3 p-3 flex flex-col justify-between space-y-2 bg-purple-50/10">
                <div>
                  {/* Price & Timeline Badge */}
                  <div className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded p-1.5 mb-2">
                    <div className="text-xs font-mono font-bold text-purple-950">
                      {currencySymbol}{service.complex?.price?.toLocaleString() || '0'}
                    </div>
                    {service.complex?.timeline && (
                      <div className="flex items-center gap-1 text-[9px] text-purple-800 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{service.complex.timeline}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {service.complex?.description && (
                    <p className="text-[10px] text-ink-700 leading-relaxed mb-2 font-medium">
                      {service.complex.description}
                    </p>
                  )}

                  {/* What it includes */}
                  {service.complex?.features && service.complex.features.length > 0 && (
                    <div className="mb-2">
                      <div className="text-[9px] uppercase font-bold text-purple-800 tracking-wider mb-1 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-purple-600" />
                        <span>What It Includes</span>
                      </div>
                      <ul className="space-y-1">
                        {service.complex.features.map((feat, fIdx) => (
                          <li key={fIdx} className="text-[9.5px] text-ink-700 leading-tight flex items-start gap-1">
                            <span className="text-purple-600 font-bold text-[8px] mt-0.5">•</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Limitations */}
                  {service.complex?.limitations && service.complex.limitations.length > 0 && (
                    <div>
                      <div className="text-[9px] uppercase font-bold text-amber-800 tracking-wider mb-1 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5 text-amber-600" />
                        <span>Limitations & Out of Scope</span>
                      </div>
                      <ul className="space-y-1">
                        {service.complex.limitations.map((lim, lIdx) => (
                          <li key={lIdx} className="text-[9.5px] text-ink-500 leading-tight flex items-start gap-1">
                            <span className="text-amber-600 font-bold text-[8px] mt-0.5">✕</span>
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commercial Terms & Policies */}
      {data.commercialTerms && data.commercialTerms.length > 0 && (
        <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-6 keep-together break-inside-avoid">
          <div className="text-[11px] font-serif font-semibold text-ink-950 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>2. Commercial Terms, Revision Policies & IP Handover</span>
            <span className="text-[9px] text-ink-400 font-mono">Standard Service Terms</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[10.5px] text-ink-700 leading-relaxed">
            {data.commercialTerms.map((term, tIdx) => (
              <li key={tIdx} className="pl-1">
                <span className="text-ink-900">{term}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Dual Senior Managing Partner Signature Execution Block */}
      <div className="border-t border-parchment-300 pt-5 mt-5 keep-together break-inside-avoid">
        <div className="text-xs font-serif font-semibold text-ink-950 uppercase tracking-wide mb-3 flex items-center justify-between">
          <span>3. Senior Managing Partner Authorization</span>
          <span className="text-[10px] text-ink-400 font-mono">Executive Sign-Off</span>
        </div>
        <p className="text-[10.5px] text-ink-600 mb-4 leading-relaxed">
          This Rate Card represents the official scheduled pricing matrix for {agency.name}. All engagements under this matrix are executed under partner supervision with guaranteed delivery standards.
        </p>

        {data.agencySigners?.mode === 'single' ? (
          <div className="max-w-md mx-auto">
            <div className="border border-parchment-200 rounded-lg p-3.5 bg-white shadow-2xs">
              <div className="text-[9.5px] uppercase font-semibold text-ink-400 tracking-wider mb-1.5">
                Authorized Senior Managing Partner
              </div>
              <div className="h-12 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                {data.agencySigners?.signer1Image || agency.primarySigner?.signatureImage ? (
                  <img
                    src={data.agencySigners?.signer1Image || agency.primarySigner.signatureImage}
                    alt="Partner Signature"
                    className="max-h-11 max-w-[200px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-base text-clay-800 font-medium">
                    {data.agencySigners?.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-ink-950">
                {data.agencySigners?.signer1Name || agency.primarySigner?.name || 'Subhadip Jana'}
              </div>
              <div className="text-[10.5px] text-ink-500">
                {data.agencySigners?.signer1Title || agency.primarySigner?.title || 'Senior Managing Partner'}
              </div>
              <div className="text-[10px] text-ink-400 font-mono mt-0.5">{agency.name}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Partner 1: Subhadip Jana */}
            <div className="border border-parchment-200 rounded-lg p-3.5 bg-white shadow-2xs">
              <div className="text-[9.5px] uppercase font-semibold text-ink-400 tracking-wider mb-1.5">
                Authorized Senior Managing Partner
              </div>
              <div className="h-12 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                {data.agencySigners?.signer1Image || agency.signatureStore?.find(s => s.partnerId === 'usr-subhadip')?.signatureImage || agency.primarySigner?.signatureImage ? (
                  <img
                    src={data.agencySigners?.signer1Image || agency.signatureStore?.find(s => s.partnerId === 'usr-subhadip')?.signatureImage || agency.primarySigner.signatureImage}
                    alt="Subhadip Jana Signature"
                    className="max-h-11 max-w-[200px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-base text-clay-800 font-medium">
                    {data.agencySigners?.signer1Name || 'Subhadip Jana'}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-ink-950">
                {data.agencySigners?.signer1Name || 'Subhadip Jana'}
              </div>
              <div className="text-[10.5px] text-ink-500">
                {data.agencySigners?.signer1Title || 'Senior Managing Partner'}
              </div>
              <div className="text-[10px] text-ink-400 font-mono mt-0.5">{agency.name}</div>
            </div>

            {/* Partner 2: Shayan Das */}
            <div className="border border-parchment-200 rounded-lg p-3.5 bg-white shadow-2xs">
              <div className="text-[9.5px] uppercase font-semibold text-ink-400 tracking-wider mb-1.5">
                Authorized Senior Managing Partner
              </div>
              <div className="h-12 border-b border-parchment-300 pb-1 mb-2 flex items-end">
                {data.agencySigners?.signer2Image || agency.signatureStore?.find(s => s.partnerId === 'usr-shayan')?.signatureImage ? (
                  <img
                    src={data.agencySigners?.signer2Image || agency.signatureStore?.find(s => s.partnerId === 'usr-shayan')?.signatureImage}
                    alt="Shayan Das Signature"
                    className="max-h-11 max-w-[200px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-base text-clay-800 font-medium">
                    {data.agencySigners?.signer2Name || 'Shayan Das'}
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-ink-950">
                {data.agencySigners?.signer2Name || 'Shayan Das'}
              </div>
              <div className="text-[10.5px] text-ink-500">
                {data.agencySigners?.signer2Title || 'Senior Managing Partner'}
              </div>
              <div className="text-[10px] text-ink-400 font-mono mt-0.5">{agency.name}</div>
            </div>
          </div>
        )}
      </div>

      <DocumentFooter 
        agency={agency} 
        confidentialNotice="Commercial Rate Card — Official Proprietary Pricing Schedule" 
      />
    </div>
  );
};

