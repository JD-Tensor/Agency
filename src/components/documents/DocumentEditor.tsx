import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Save, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Loader2,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { SavedDocument, DocumentPayload } from '../../types/documents';
import { triggerNativePrint } from '../../services/pdfGenerator';
import { SendDocumentModal } from './SendDocumentModal';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { CurrencyCode, translateDocumentPayload, normalizeCurrencyCode } from '../../services/currency';

// Forms
import { DiscoveryForm } from '../forms/DiscoveryForm';
import { ProposalForm } from '../forms/ProposalForm';
import { QuotationForm } from '../forms/QuotationForm';
import { RateChartForm } from '../forms/RateChartForm';
import { OnboardingForm } from '../forms/OnboardingForm';
import { NdaForm } from '../forms/NdaForm';
import { InvoiceForm } from '../forms/InvoiceForm';
import { ReceiptForm } from '../forms/ReceiptForm';
import { OffboardingForm } from '../forms/OffboardingForm';

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

export const DocumentEditor: React.FC = () => {
  const { 
    editingDocument, 
    closeEditor, 
    saveCurrentDoc, 
    agencyProfile,
    clients,
    activeCurrency
  } = useAgency();

  if (!editingDocument) {
    return (
      <div className="p-12 text-center text-ink-500 text-sm">
        No document currently selected.
      </div>
    );
  }

  const [currentDoc, setCurrentDoc] = useState<SavedDocument>(editingDocument);
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'both' | 'form' | 'preview'>('both');
  const [sendModalOpen, setSendModalOpen] = useState<boolean>(false);

  // Immediately synchronize currentDoc if user switches document from sidebar
  useEffect(() => {
    if (editingDocument) {
      setCurrentDoc(editingDocument);
    }
  }, [editingDocument?.id, editingDocument?.type]);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePayloadChange = (newPayload: DocumentPayload) => {
    // Derive client name or title dynamically if changed in form
    let updatedClientName = currentDoc.clientName;
    const payloadData = newPayload.data as any;
    if (payloadData.clientCompany) {
      updatedClientName = payloadData.clientCompany;
    } else if (payloadData.clientName) {
      updatedClientName = payloadData.clientName;
    }

    setCurrentDoc((prev) => ({
      ...prev,
      clientName: updatedClientName,
      payload: newPayload
    }));
  };

  const currentDocCurrency = normalizeCurrencyCode((currentDoc.payload.data as any)?.currency || activeCurrency);

  const handleDocumentCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency === currentDocCurrency) return;
    const translatedPayload = translateDocumentPayload(currentDoc.payload, newCurrency);
    const updatedDoc: SavedDocument = {
      ...currentDoc,
      payload: translatedPayload
    };
    setCurrentDoc(updatedDoc);
    saveCurrentDoc(updatedDoc);
  };

  const handleSave = () => {
    setIsSaving(true);
    saveCurrentDoc(currentDoc);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
    }, 300);
  };

  const handlePrint = () => {
    // Auto-save changes before triggering native print
    saveCurrentDoc(currentDoc);
    triggerNativePrint();
  };

  const renderActiveForm = () => {
    switch (currentDoc.type) {
      case 'discovery':
        return (
          <DiscoveryForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'discovery', data: newData })}
          />
        );
      case 'proposal':
        return (
          <ProposalForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'proposal', data: newData })}
          />
        );
      case 'quotation':
        return (
          <QuotationForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'quotation', data: newData })}
          />
        );
      case 'rate_chart':
        return (
          <RateChartForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'rate_chart', data: newData })}
          />
        );
      case 'onboarding':
        return (
          <OnboardingForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'onboarding', data: newData })}
          />
        );
      case 'nda':
        return (
          <NdaForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'nda', data: newData })}
          />
        );
      case 'invoice':
        return (
          <InvoiceForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'invoice', data: newData })}
          />
        );
      case 'receipt':
        return (
          <ReceiptForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'receipt', data: newData })}
          />
        );
      case 'offboarding':
        return (
          <OffboardingForm
            data={currentDoc.payload.data as any}
            onChange={(newData) => handlePayloadChange({ type: 'offboarding', data: newData })}
          />
        );
    }
  };

  const renderActiveTemplate = () => {
    switch (currentDoc.type) {
      case 'discovery':
        return (
          <DiscoveryTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
            docNumber={currentDoc.docNumber}
          />
        );
      case 'proposal':
        return (
          <ProposalTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
          />
        );
      case 'quotation':
        return (
          <QuotationTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
            docNumber={currentDoc.docNumber}
          />
        );
      case 'rate_chart':
        return (
          <RateChartTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
            docNumber={currentDoc.docNumber}
          />
        );
      case 'onboarding':
        return (
          <OnboardingTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
            docNumber={currentDoc.docNumber}
          />
        );
      case 'nda':
        return (
          <NdaTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
            docNumber={currentDoc.docNumber}
          />
        );
      case 'invoice':
        return (
          <InvoiceTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
          />
        );
      case 'receipt':
        return (
          <ReceiptTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
          />
        );
      case 'offboarding':
        return (
          <OffboardingTemplate
            data={currentDoc.payload.data as any}
            agency={agencyProfile}
            docNumber={currentDoc.docNumber}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white border border-parchment-200 rounded-xl px-4 py-3 shadow-xs flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={closeEditor}
            className="p-1.5 rounded-lg text-ink-500 hover:text-ink-950 hover:bg-parchment-100 transition"
            title="Back to Archive"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={currentDoc.title}
                onChange={(e) => setCurrentDoc({ ...currentDoc, title: e.target.value })}
                className="font-serif text-base font-semibold text-ink-950 hover:border-b border-dashed border-parchment-400 focus:outline-none focus:border-clay-600 bg-transparent"
                placeholder="Document Title..."
              />
              <span className="font-mono text-xs text-ink-500 bg-parchment-100 px-2 py-0.5 rounded border border-parchment-200">
                {currentDoc.docNumber}
              </span>
            </div>
            <div className="text-[11px] text-ink-500 flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1.5">
                <span>Client:</span>
                {clients.length > 0 ? (
                  <select
                    value={currentDoc.clientId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const matched = clients.find((c) => c.id === selectedId);
                      if (matched) {
                        setCurrentDoc({
                          ...currentDoc,
                          clientId: matched.id,
                          clientName: matched.companyName
                        });
                      }
                    }}
                    className="text-[11px] font-semibold text-ink-800 bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-clay-600"
                  >
                    <option value="">{currentDoc.clientName || 'Select Client...'}</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <strong className="text-ink-700">{currentDoc.clientName}</strong>
                )}
              </div>
              <span>•</span>
              <select
                value={currentDoc.status}
                onChange={(e) => setCurrentDoc({ ...currentDoc, status: e.target.value as any })}
                className="text-[10px] font-medium uppercase tracking-wider bg-parchment-100 border border-parchment-200 rounded px-1.5 py-0.5"
              >
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="completed">Completed</option>
              </select>

              {currentDoc.sharedWithClient && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>In Client Portal</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Document Currency Switcher & Auto-Translation */}
          <CurrencyToggle
            value={currentDocCurrency}
            onChange={handleDocumentCurrencyChange}
            size="sm"
            showRateNotice={true}
          />

          {/* View Toggles (Split vs Form Only vs Preview Only) */}
          <div className="hidden lg:flex items-center bg-parchment-100 p-0.5 rounded-lg border border-parchment-200 text-xs">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                activeTab === 'form' ? 'bg-white text-ink-950 font-medium shadow-xs' : 'text-ink-600 hover:text-ink-950'
              }`}
            >
              Form
            </button>
            <button
              onClick={() => setActiveTab('both')}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                activeTab === 'both' ? 'bg-white text-ink-950 font-medium shadow-xs' : 'text-ink-600 hover:text-ink-950'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                activeTab === 'preview' ? 'bg-white text-ink-950 font-medium shadow-xs' : 'text-ink-600 hover:text-ink-950'
              }`}
            >
              Live A4
            </button>
          </div>

          {/* Zoom controls (for preview) */}
          {(activeTab === 'both' || activeTab === 'preview') && (
            <div className="hidden md:flex items-center gap-1 bg-parchment-100 p-0.5 rounded-lg border border-parchment-200 text-xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.45, z - 0.1))}
                className="p-1 text-ink-600 hover:text-ink-950 rounded hover:bg-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-ink-700">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
                className="p-1 text-ink-600 hover:text-ink-950 rounded hover:bg-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-300 hover:bg-parchment-100 text-ink-800 text-xs font-medium transition"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-ink-500" />
            ) : saveSuccessNotice ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Save className="w-3.5 h-3.5 text-ink-600" />
            )}
            <span>{saveSuccessNotice ? 'Saved!' : 'Save'}</span>
          </button>

          {/* Primary Print / Save as PDF Action */}
          <button
            onClick={handlePrint}
            title="Print document or Save as PDF via browser"
            className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {/* Send to Client Action */}
          <button
            onClick={() => setSendModalOpen(true)}
            title="Dispatch or share document with client portal"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-xs ${
              currentDoc.sharedWithClient
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-forest-700 hover:bg-forest-800 text-white'
            }`}
          >
            {currentDoc.sharedWithClient ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sent to Client</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send to Client</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden print:block print:h-auto print:overflow-visible print:p-0 print:m-0">
        {/* Left: Interactive Form */}
        {(activeTab === 'both' || activeTab === 'form') && (
          <div className={`${activeTab === 'both' ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white border border-parchment-200 rounded-xl p-6 overflow-y-auto shadow-xs no-print`}>
            {renderActiveForm()}
          </div>
        )}

        {/* Right: Live A4 Document Preview */}
        {(activeTab === 'both' || activeTab === 'preview') && (
          <div className={`${activeTab === 'both' ? 'lg:col-span-7' : 'lg:col-span-12'} bg-parchment-200/60 border border-parchment-300/80 rounded-xl p-6 overflow-auto flex flex-col items-center shadow-inner print:bg-white print:border-none print:shadow-none print:p-0 print:m-0 print:h-auto print:overflow-visible print:block`}>
            <div 
              style={{ 
                transform: `scale(${zoomLevel})`, 
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className="my-2 print:my-0 print:p-0 print:transform-none print:w-full print:block"
            >
              {/* This inner container holds the pristine A4 document that gets rendered to PDF or printed */}
              <div ref={printRef} id="printable-document" className="print:w-full print:m-0 print:p-0 print:block">
                {renderActiveTemplate()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Send Document to Client Portal Modal */}
      <SendDocumentModal
        isOpen={sendModalOpen}
        document={currentDoc}
        onClose={() => setSendModalOpen(false)}
        onSuccess={(updated) => {
          setCurrentDoc(updated);
        }}
      />
    </div>
  );
};
