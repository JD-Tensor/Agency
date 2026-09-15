import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Edit3, 
  Copy, 
  Trash2, 
  Plus,
  Send,
  CheckCircle2
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { DocumentType, SavedDocument } from '../../types/documents';
import { SendDocumentModal } from './SendDocumentModal';

export const DocumentList: React.FC = () => {
  const { 
    savedDocuments, 
    openEditorForEdit, 
    deleteDoc, 
    clearAllDocs,
    cloneDoc,
    currentUser,
    setCurrentView 
  } = useAgency();

  const canCreateDocs = currentUser?.accessLevel === 'admin' || currentUser?.accessLevel === 'project_lead';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDocToSend, setSelectedDocToSend] = useState<SavedDocument | null>(null);

  const filteredDocs = savedDocuments.filter((doc) => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-medium">Paid</span>;
      case 'approved':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded font-medium">Approved</span>;
      case 'issued':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-medium">Issued</span>;
      case 'completed':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded font-medium">Completed</span>;
      default:
        return <span className="bg-parchment-200 text-ink-700 border border-parchment-300 text-[10px] px-2 py-0.5 rounded font-medium">Draft</span>;
    }
  };

  const getTypeBadge = (type: DocumentType) => {
    const labelMap: Record<DocumentType, string> = {
      discovery: 'Discovery Call',
      proposal: 'Proposal',
      quotation: 'Quotation',
      rate_chart: 'Rate Chart',
      onboarding: 'Onboarding',
      nda: 'NDA',
      invoice: 'Invoice',
      receipt: 'Receipt',
      offboarding: 'Offboarding'
    };
    return (
      <span className="text-[10px] uppercase font-semibold text-ink-500 bg-parchment-100 px-2 py-0.5 rounded border border-parchment-200">
        {labelMap[type] || type}
      </span>
    );
  };

  const handleDelete = (doc: SavedDocument) => {
    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      deleteDoc(doc.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">
            Document Archive & History
          </h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            View, edit, duplicate, and re-download any existing agency business document
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreateDocs && savedDocuments.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Permanently delete ALL documents from the database? This cannot be undone.')) {
                  clearAllDocs();
                }
              }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
              title="Permanently delete every document in the archive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All Documents</span>
            </button>
          )}
          {canCreateDocs && (
            <button
              onClick={() => setCurrentView('hub')}
              className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-parchment-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, title, or doc #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-parchment-200 rounded-lg focus:outline-none focus:border-clay-600 bg-parchment-50/50"
          />
        </div>

        {/* Type and Status Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <Filter className="w-3 h-3" />
            <span>Type:</span>
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="text-xs p-1.5 border border-parchment-200 rounded-lg bg-white text-ink-800"
          >
            <option value="all">All Document Types</option>
            <option value="discovery">Discovery Call</option>
            <option value="proposal">Proposal & SOW</option>
            <option value="quotation">Quotation</option>
            <option value="rate_chart">Rate Chart</option>
            <option value="onboarding">Onboarding</option>
            <option value="nda">Mutual NDA</option>
            <option value="invoice">Invoice</option>
            <option value="receipt">Receipt</option>
            <option value="offboarding">Offboarding</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs p-1.5 border border-parchment-200 rounded-lg bg-white text-ink-800 ml-1"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-parchment-200 rounded-xl overflow-hidden shadow-xs">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-parchment-100 flex items-center justify-center text-ink-400">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base text-ink-800 font-medium mb-1">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' 
                ? 'No matching documents found' 
                : 'Document archive is empty'}
            </h3>
            <p className="text-xs text-ink-500 max-w-md mx-auto mb-4">
              {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search keywords or clearing the active filters.'
                : 'Your archive has been cleared. You can now generate real client contracts, proposals, quotations, and invoices.'}
            </p>
            {canCreateDocs && (
              <button
                onClick={() => setCurrentView('hub')}
                className="inline-flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs px-3.5 py-2 rounded-lg font-medium transition shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-parchment-50 text-ink-500 text-[10px] uppercase font-semibold border-b border-parchment-200">
                <tr>
                  <th className="p-3.5">Document Title & Details</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Client</th>
                  <th className="p-3.5">Document #</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Portal Delivery</th>
                  <th className="p-3.5">Updated</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100">
                {filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-parchment-50/50 transition">
                    <td className="p-3.5">
                      <div className="font-medium text-ink-900 text-xs">{doc.title}</div>
                      <div className="text-[10px] text-ink-400 mt-0.5">ID: {doc.id}</div>
                    </td>
                    <td className="p-3.5">
                      {getTypeBadge(doc.type)}
                    </td>
                    <td className="p-3.5 font-medium text-ink-800">
                      {doc.clientName}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-ink-600">
                      {doc.docNumber}
                    </td>
                    <td className="p-3.5">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="p-3.5">
                      {doc.sharedWithClient ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Live in Portal</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-ink-400 bg-parchment-100 px-2 py-0.5 rounded">
                          Internal Only
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-ink-500 text-[11px]">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDocToSend(doc)}
                          title={doc.sharedWithClient ? 'Manage Client Portal sharing' : 'Send to Client Portal'}
                          className={`flex items-center gap-1 px-2 py-1 rounded transition text-xs font-medium ${
                            doc.sharedWithClient
                              ? 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                              : 'text-forest-700 hover:text-forest-800 bg-forest-50 hover:bg-forest-100 border border-forest-200'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>{doc.sharedWithClient ? 'Shared' : 'Send'}</span>
                        </button>
                        <button
                          onClick={() => openEditorForEdit(doc)}
                          title="Edit and redownload updated PDF"
                          className="flex items-center gap-1 text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 px-2 py-1 rounded transition text-xs font-medium"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => cloneDoc(doc.id)}
                          title="Clone as new template"
                          className="p-1 text-ink-500 hover:text-ink-800 hover:bg-parchment-100 rounded transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          title="Delete document"
                          className="p-1 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Send to Client Modal */}
      <SendDocumentModal
        isOpen={Boolean(selectedDocToSend)}
        document={selectedDocToSend}
        onClose={() => setSelectedDocToSend(null)}
      />
    </div>
  );
};
