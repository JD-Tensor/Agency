import React, { useState } from 'react';
import { 
  X, 
  Files, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Eye
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { ClientAccount } from '../../types/client';
import { SavedDocument } from '../../types/documents';
import { ClientDocumentModal } from '../client/ClientDocumentModal';

interface ManageClientDocumentsModalProps {
  client: ClientAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ManageClientDocumentsModal: React.FC<ManageClientDocumentsModalProps> = ({
  client,
  isOpen,
  onClose
}) => {
  const { 
    savedDocuments, 
    sendDocumentToClient, 
    unshareDocumentFromClient, 
    agencyProfile 
  } = useAgency();

  const [selectedDocIdToAttach, setSelectedDocIdToAttach] = useState<string>('');
  const [inspectingDoc, setInspectingDoc] = useState<SavedDocument | null>(null);

  if (!isOpen || !client) return null;

  // Documents already shared with this client
  const sharedDocs = savedDocuments.filter((doc) => {
    return (
      client.sharedDocumentIds?.includes(doc.id) ||
      doc.clientId === client.id ||
      doc.clientName.toLowerCase().includes(client.companyName.toLowerCase())
    );
  });

  // Available documents in archive not yet shared with this client
  const availableDocs = savedDocuments.filter((doc) => {
    return !sharedDocs.some((sd) => sd.id === doc.id);
  });

  const handleAttachDocument = () => {
    if (!selectedDocIdToAttach) return;
    sendDocumentToClient(selectedDocIdToAttach, client.id);
    setSelectedDocIdToAttach('');
  };

  const handleRemoveDocument = (docId: string) => {
    unshareDocumentFromClient(docId, client.id);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="w-full max-w-2xl bg-white border border-parchment-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-parchment-200 flex items-center justify-between bg-parchment-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-clay-100 text-clay-700 flex items-center justify-center border border-clay-200">
                <Files className="w-4 h-4 text-clay-600" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-ink-950">
                  Shared Documents Vault
                </h3>
                <p className="text-[11px] text-ink-500">
                  Client: <strong className="text-ink-800">{client.companyName}</strong> (Attn: {client.contactName})
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

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Quick Attach Bar */}
            <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-4 space-y-3">
              <label className="text-xs font-semibold text-ink-900 flex items-center justify-between">
                <span>Send Document from Archive to {client.companyName}</span>
                <span className="text-[10px] font-normal text-ink-500">
                  {availableDocs.length} available to send
                </span>
              </label>

              {availableDocs.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={selectedDocIdToAttach}
                    onChange={(e) => setSelectedDocIdToAttach(e.target.value)}
                    className="flex-1 text-xs p-2 border border-parchment-200 rounded-lg bg-white text-ink-800 focus:outline-none focus:border-clay-600"
                  >
                    <option value="">Select a document to dispatch...</option>
                    {availableDocs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title} ({d.docNumber}) — {d.type.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAttachDocument}
                    disabled={!selectedDocIdToAttach}
                    className="flex items-center gap-1.5 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Client</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-ink-500 italic">
                  All current agency documents are already shared with this client or no additional documents exist.
                </div>
              )}
            </div>

            {/* Current Shared Documents List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-ink-600">
                  Active Documents in Client Portal ({sharedDocs.length})
                </h4>
              </div>

              {sharedDocs.length > 0 ? (
                <div className="space-y-2">
                  {sharedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-white border border-parchment-200 rounded-xl flex items-center justify-between hover:bg-parchment-50/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-clay-50 text-clay-700 flex items-center justify-center text-[10px] font-bold border border-clay-200">
                          {doc.type.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-ink-950 flex items-center gap-2">
                            <span>{doc.title}</span>
                            <span className="font-mono text-[10px] text-ink-500 bg-parchment-100 px-1.5 py-0.2 rounded">
                              {doc.docNumber}
                            </span>
                          </div>
                          <div className="text-[10px] text-ink-500 flex items-center gap-2 mt-0.5">
                            <span>Status: <strong className="text-ink-700 uppercase">{doc.status}</strong></span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Live in Portal
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectingDoc(doc)}
                          className="flex items-center gap-1 text-[11px] text-ink-600 hover:text-ink-950 bg-parchment-100 hover:bg-parchment-200 px-2.5 py-1 rounded transition"
                          title="View document as client sees it"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Revoke client access to this document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-parchment-50 border border-dashed border-parchment-300 rounded-xl space-y-1">
                  <Files className="w-8 h-8 text-ink-400 mx-auto" />
                  <div className="text-xs font-semibold text-ink-700">No documents shared yet</div>
                  <p className="text-[11px] text-ink-500">
                    Use the selector above or the &quot;Send to Client&quot; button in Document Editor to dispatch documents to {client.companyName}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-parchment-200 bg-parchment-50/70 flex justify-end">
            <button
              onClick={onClose}
              className="bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Document View Modal */}
      {inspectingDoc && (
        <ClientDocumentModal
          document={inspectingDoc}
          agencyProfile={agencyProfile}
          onClose={() => setInspectingDoc(null)}
        />
      )}
    </>
  );
};
