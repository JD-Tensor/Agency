import React, { useCallback, useEffect, useState } from 'react';
import { Inbox, Mail, RefreshCw, Search, Trash2 } from 'lucide-react';
import * as api from '../../services/api';
import { Inquiry, InquiryStatus } from '../../services/api';

const STATUS_STYLE: Record<InquiryStatus, string> = {
  new: 'text-clay-700 bg-clay-50 border-clay-100',
  contacted: 'text-amber-800 bg-amber-50 border-amber-200',
  closed: 'text-emerald-800 bg-emerald-50 border-emerald-200',
};

const FILTERS: (InquiryStatus | 'all')[] = ['all', 'new', 'contacted', 'closed'];

export const InquiriesView: React.FC = () => {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<InquiryStatus | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await api.fetchInquiriesApi());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: string, status: InquiryStatus) => {
    const prev = items;
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
    try { await api.updateInquiryStatusApi(id, status); }
    catch (e) { setItems(prev); setError(e instanceof Error ? e.message : 'Update failed'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    try { await api.deleteInquiryApi(id); setItems((p) => p.filter((i) => i.id !== id)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Delete failed'); }
  };

  const q = query.toLowerCase();
  const shown = items.filter((i) =>
    (filter === 'all' || i.status === filter) &&
    (i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.message.toLowerCase().includes(q)));
  const newCount = items.filter((i) => i.status === 'new').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">Website Inquiries</h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            Messages submitted through the landing page contact form.
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-parchment-200 bg-white hover:border-clay-300 text-ink-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or message…"
            className="w-full text-xs pl-8 pr-3 py-2 border border-parchment-200 rounded-lg focus:outline-none focus:border-clay-600 bg-parchment-50/50"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] capitalize font-semibold px-3 py-1.5 rounded-lg border ${
                filter === f ? 'bg-clay-100 text-clay-900 border-clay-100' : 'bg-white text-ink-600 border-parchment-200 hover:border-clay-300'
              }`}
            >
              {f}{f === 'new' && newCount > 0 ? ` (${newCount})` : ''}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

      {!loading && shown.length === 0 && !error && (
        <div className="bg-white border border-dashed border-parchment-300 rounded-2xl py-16 text-center text-ink-500">
          <Inbox className="w-8 h-8 mx-auto mb-3 text-ink-400" />
          <div className="text-sm font-medium text-ink-700">No inquiries yet</div>
          <div className="text-xs mt-1">New submissions from the landing page will appear here.</div>
        </div>
      )}

      <div className="space-y-3">
        {shown.map((i) => (
          <div key={i.id} className="bg-white border border-parchment-200 rounded-2xl p-5 hover:border-clay-300 transition">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-clay-700 to-ink-950 text-white flex items-center justify-center font-serif font-bold">
                  {i.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-serif text-base font-semibold text-ink-950 leading-tight">{i.name}</div>
                  <a href={`mailto:${i.email}`} className="text-[11px] text-clay-700 font-mono hover:underline flex items-center gap-1">
                    <Mail className="w-3 h-3" />{i.email}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-ink-400 font-mono">{new Date(i.createdAt).toLocaleString()}</span>
                <select
                  value={i.status}
                  onChange={(e) => setStatus(i.id, e.target.value as InquiryStatus)}
                  className={`text-[10px] uppercase font-bold px-2 py-1 rounded border focus:outline-none ${STATUS_STYLE[i.status]}`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
                <button onClick={() => remove(i.id)} title="Delete" className="p-1.5 rounded-lg text-ink-400 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-sm text-ink-700 leading-relaxed whitespace-pre-wrap break-words">{i.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
