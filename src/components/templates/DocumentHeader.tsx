import React from 'react';
import { AgencyProfile } from '../../types/agency';

interface DocumentHeaderProps {
  agency: AgencyProfile;
  docTitle: string;
  docNumber: string;
  docDate: string;
  docTypeBadge?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  agency,
  docTitle,
  docNumber,
  docDate,
  docTypeBadge
}) => {
  return (
    <div className="border-b border-parchment-300 pb-6 mb-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-clay-600 inline-block"></span>
            <span className="text-xs tracking-wider uppercase font-semibold text-ink-600">
              {agency.name}
            </span>
            {docTypeBadge && (
              <span className="text-[10px] uppercase tracking-wide bg-parchment-200 text-ink-700 px-2 py-0.5 rounded-full border border-parchment-300">
                {docTypeBadge}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-serif text-ink-950 font-normal tracking-tight">
            {docTitle}
          </h1>
          <p className="text-xs text-ink-500 mt-0.5 font-light">
            {agency.tagline}
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-medium text-ink-800 bg-parchment-100 px-2.5 py-1 rounded border border-parchment-300 inline-block">
            {docNumber}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Date: <span className="font-medium text-ink-800">{docDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DocumentFooterProps {
  agency: AgencyProfile;
  confidentialNotice?: string;
  pageNumber?: string;
}

export const DocumentFooter: React.FC<DocumentFooterProps> = ({
  agency,
  confidentialNotice = 'Confidential & Proprietary — Prepared for Client use only',
  pageNumber
}) => {
  return (
    <div className="border-t border-parchment-200 pt-4 mt-8 text-[10px] text-ink-500 flex items-center justify-between">
      <div>
        <span className="font-medium text-ink-700">{agency.name}</span>
        {agency.email && <span> • {agency.email}</span>}
        {agency.website && <span> • {agency.website}</span>}
      </div>
      <div className="flex items-center gap-3">
        <span>{confidentialNotice}</span>
        {pageNumber && <span className="font-mono text-ink-600">{pageNumber}</span>}
      </div>
    </div>
  );
};

