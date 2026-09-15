import React, { useRef } from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { SavedDocument } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { triggerNativePrint } from '../../services/pdfGenerator';

// Printable Templates
import { DiscoveryTemplate } from '../templates/DiscoveryTemplate';
import { ProposalTemplate } from '../templates/ProposalTemplate';
import { QuotationTemplate } from '../templates/QuotationTemplate';
import { RateChartTemplate } from '../templates/RateChartTemplate';
import { OnboardingTemplate } from '../templates/OnboardingTemplate';
import { NdaTemplate } from '../templates/NdaTemplate';
import { InvoiceTemplate } from '../templates/InvoiceTemplate';
import { ReceiptTemplate } from '../templates/ReceiptTemplate';
import { OffboardingTemplate } from '../templates/OffboardingTemplate';

interface ClientDocumentModalProps {
  document: SavedDocument | null;
  agencyProfile: AgencyProfile;
  onClose: () => void;
}

export const ClientDocumentModal: React.FC<ClientDocumentModalProps> = ({
  document: doc,
  agencyProfile,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!doc) return null;

  const renderActiveTemplate = () => {
    switch (doc.type) {
      case 'discovery':
        return (
          <DiscoveryTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
            docNumber={doc.docNumber}
          />
        );
      case 'proposal':
        return (
          <ProposalTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
          />
        );
      case 'quotation':
        return (
          <QuotationTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
            docNumber={doc.docNumber}
          />
        );
      case 'rate_chart':
        return (
          <RateChartTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
            docNumber={doc.docNumber}
          />
        );
      case 'onboarding':
        return (
          <OnboardingTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
            docNumber={doc.docNumber}
          />
        );
      case 'nda':
        return (
          <NdaTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
            docNumber={doc.docNumber}
          />
        );
      case 'invoice':
        return (
          <InvoiceTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
          />
        );
      case 'receipt':
        return (
          <ReceiptTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
          />
        );
      case 'offboarding':
        return (
          <OffboardingTemplate
            data={doc.payload.data as any}
            agency={agencyProfile}
            docNumber={doc.docNumber}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-in fade-in duration-150 print:static print:p-0 print:bg-transparent print:backdrop-blur-none print:block">
      <div className="w-full max-w-5xl bg-white border border-parchment-300 rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none print:overflow-visible print:block">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-parchment-200 flex items-center justify-between bg-parchment-50/70 no-print">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-clay-100 text-clay-700 flex items-center justify-center font-bold text-xs border border-clay-200">
              <ShieldCheck className="w-4 h-4 text-clay-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-semibold text-ink-950">
                  {doc.title}
                </h3>
                <span className="font-mono text-xs text-ink-500 bg-parchment-200 px-2 py-0.5 rounded border border-parchment-300">
                  {doc.docNumber}
                </span>
              </div>
              <div className="text-[11px] text-ink-500 flex items-center gap-2 mt-0.5">
                <span>Issued by: <strong className="text-ink-700">{agencyProfile.name}</strong></span>
                <span>•</span>
                <span className="uppercase font-semibold text-[10px] text-forest-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {doc.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerNativePrint}
              className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-xs"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-parchment-200 transition"
              title="Close Preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable A4 Preview Container */}
        <div className="flex-1 bg-parchment-200/70 p-6 overflow-y-auto flex flex-col items-center print:bg-white print:p-0 print:m-0 print:h-auto print:overflow-visible print:block">
          <div ref={printRef} id="printable-document" className="shadow-lg my-2 print:shadow-none print:my-0 print:p-0 print:w-full print:block">
            {renderActiveTemplate()}
          </div>
        </div>
      </div>
    </div>
  );
};

