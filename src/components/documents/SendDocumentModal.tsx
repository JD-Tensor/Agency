import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Building2, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { SavedDocument } from '../../types/documents';

interface SendDocumentModalProps {
  document: SavedDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedDoc: SavedDocument) => void;
}

export const SendDocumentModal: React.FC<SendDocumentModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { clients, sendDocumentToClient, unshareDocumentFromClient } = useAgency();

  if (!isOpen || !doc) return null;

  // Find if doc already matches a client by id or name
  const existingClient = clients.find(
    (c) => c.id === doc.clientId || 
    c.companyName.toLowerCase() === doc.clientName.toLowerCase()
  );

  const [selectedClientId, setSelectedClientId] = useState<string>(existingClient?.id || clients[0]?.id || '');
  const [deliveryNotes, setDeliveryNotes] = useState<string>(
    doc.clientNotes || `Please find attached the official ${doc.title} (${doc.docNumber}) for your organization's review.`
  );
  const [isSentSuccess, setIsSentSuccess] = useState<boolean>(false);
  const [copiedSlip, setCopiedSlip] = useState<boolean>(false);

  const targetClient = clients.find((c) => c.id === selectedClientId);
  const isAlreadyShared = targetClient?.sharedDocumentIds?.includes(doc.id) || (doc.clientId === targetClient?.id && doc.sharedWithClient);

  const handleSend = async () => {
    if (!selectedClientId) return;
    const ok = await sendDocumentToClient(doc.id, selectedClientId, deliveryNotes);
    if (ok) {
      setIsSentSuccess(true);
      if (onSuccess) {
        onSuccess({
          ...doc,
          clientId: selectedClientId,
          clientName: targetClient?.companyName || doc.clientName,
          status: doc.status === 'draft' ? 'issued' : doc.status,
          sharedWithClient: true,
          sharedAt: new Date().toISOString(),
          clientNotes: deliveryNotes
        });
      }
    }
  };

  const handleUnshare = () => {
    if (!selectedClientId) return;
    unshareDocumentFromClient(doc.id, selectedClientId);
    onClose();
  };

  const handleCopySlip = () => {
    if (!targetClient) return;
    const slip = `Official Document Dispatch from JD Tensor:
- Document: ${doc.title} (${doc.docNumber})
- Issued To: ${targetClient.companyName} (Attn: ${targetClient.contactName})
- Status: Issued / Available for Client Review
- Portal Link: ${window.location.origin}
- Memo: ${deliveryNotes}

Please login with your company credentials to review or execute this document.`;

    navigator.clipboard.writeText(slip);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-parchment-300 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-parchment-200 flex items-center justify-between bg-parchment-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center border border-forest-200">
              <Send className="w-4 h-4 text-forest-600" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-ink-950">
                Send Document to Client
              </h3>
              <p className="text-[11px] text-ink-500 font-mono">
                {doc.docNumber} • {doc.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-parchment-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isSentSuccess ? (
            /* Success View */
            <div className="space-y-4 text-center py-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-serif text-lg font-semibold text-ink-950">
                  Document Dispatched to Client Portal!
                </h4>
                <p className="text-xs text-ink-600 max-w-sm mx-auto">
                  <strong>{doc.title}</strong> is now live and immediately accessible inside{' '}
                  <span className="font-semibold text-ink-900">{targetClient?.companyName}</span>&apos;s Client Portal.
                </p>
              </div>

              {/* Ready-to-copy Notification Card */}
              <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-3.5 text-left text-xs space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-ink-700">
                  <span>Client Notification Slip</span>
                  <button
                    onClick={handleCopySlip}
                    className="flex items-center gap-1 text-forest-700 hover:text-forest-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition font-medium"
                  >
                    {copiedSlip ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-ink-600 space-y-0.5 bg-white p-2.5 rounded border border-parchment-200">
                  <div><strong>Document:</strong> {doc.title} ({doc.docNumber})</div>
                  <div><strong>Client:</strong> {targetClient?.companyName}</div>
                  <div><strong>Contact:</strong> {targetClient?.contactName} ({targetClient?.email})</div>
                  <div><strong>Portal URL:</strong> {window.location.origin}</div>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={onClose}
                  className="bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-6 py-2 rounded-lg transition shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Configure & Send View */
            <>
              {/* Document Pill */}
              <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-clay-100 text-clay-700 flex items-center justify-center font-bold text-[10px]">
                    {doc.type.slice(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-ink-950">{doc.title}</div>
                    <div className="text-[10px] text-ink-500 font-mono">{doc.docNumber}</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-parchment-200 text-ink-700">
                  {doc.status}
                </span>
              </div>

              {/* Target Client Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-900 flex items-center justify-between">
                  <span>Target Client Organization</span>
                  <span className="text-[10px] font-normal text-ink-500">
                    {clients.length} Registered Client{clients.length !== 1 ? 's' : ''}
                  </span>
                </label>
                {clients.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {clients.map((c) => {
                      const isSelected = c.id === selectedClientId;
                      const hasDoc = c.sharedDocumentIds?.includes(doc.id);
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedClientId(c.id)}
                          className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-clay-50/80 border-clay-300 ring-1 ring-clay-400'
                              : 'bg-white border-parchment-200 hover:bg-parchment-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-clay-600 text-white' : 'bg-parchment-100 text-ink-600'
                            }`}>
                              <Building2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
                                <span>{c.companyName}</span>
                                {hasDoc && (
                                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 font-medium">
                                    Currently Shared
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-ink-500">
                                Attn: {c.contactName} • {c.email}
                              </div>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="targetClient"
                            checked={isSelected}
                            onChange={() => setSelectedClientId(c.id)}
                            className="accent-clay-600"
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-800 space-y-1">
                    <AlertCircle className="w-4 h-4 mx-auto text-amber-600" />
                    <div>No clients registered in the directory yet.</div>
                    <div className="text-[10px] text-amber-700">
                      Please setup a client first in <strong>Clients & Portals</strong>.
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Note / Memo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-900 flex items-center justify-between">
                  <span>Client Memo / Delivery Note</span>
                  <span className="text-[10px] text-ink-400 font-normal">Optional message in client portal</span>
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-parchment-200 rounded-lg focus:outline-none focus:border-clay-600 bg-white"
                  placeholder="Enter a note or instructions for the client..."
                />
              </div>

              {/* Dispatch Action Bar */}
              <div className="pt-2 border-t border-parchment-200 flex items-center justify-between">
                <div>
                  {isAlreadyShared && (
                    <button
                      onClick={handleUnshare}
                      type="button"
                      className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                    >
                      Unshare from Client
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    type="button"
                    className="px-3.5 py-1.5 border border-parchment-300 hover:bg-parchment-100 text-ink-700 text-xs font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!selectedClientId}
                    className="flex items-center gap-1.5 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAlreadyShared ? 'Re-send / Update Portal' : 'Send to Client Portal'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
