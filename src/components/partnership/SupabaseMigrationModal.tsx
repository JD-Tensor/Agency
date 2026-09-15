import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  FileCode, 
  X,
  Check,
  Save,
  KeyRound,
  Trash2
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  setSupabaseConfig, 
  clearSupabaseConfig 
} from '../../services/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseMigrationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [urlInput, setUrlInput] = useState(() => getSupabaseConfig().url);
  const [keyInput, setKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const isConnected = isSupabaseConfigured();
  const { url, isFromEnv } = getSupabaseConfig();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) {
      alert('Please enter both your Supabase Project URL and Anon Key.');
      return;
    }
    setSupabaseConfig(urlInput.trim(), keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to clear the configured Supabase credentials?')) {
      clearSupabaseConfig();
      setUrlInput('');
      setKeyInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-parchment-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-parchment-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-clay-50 text-clay-700'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-ink-950 flex items-center gap-2">
                Supabase Cloud Database Settings
              </h2>
              <p className="text-xs text-ink-500">
                Direct cloud database connection. Local SQLite has been completely decommissioned.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 p-1 rounded-lg hover:bg-parchment-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Database Status Banner */}
        <div className={`p-4 rounded-xl border mb-6 flex items-start gap-3.5 ${
          isConnected 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {isConnected ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs leading-relaxed flex-1">
            {isConnected ? (
              <div>
                <strong className="text-sm font-semibold">Supabase Cloud Database Connected!</strong>
                <p className="text-emerald-800 mt-0.5">
                  Connected to: <span className="font-mono font-medium">{url}</span>. 
                  {isFromEnv ? ' (Loaded from .env)' : ' (Saved in browser)'}
                </p>
                <p className="text-emerald-700 mt-1">
                  All 10 partnership ledgers, client contracts, and invoices sync directly with your PostgreSQL instance in the cloud.
                </p>
              </div>
            ) : (
              <div>
                <strong className="text-sm font-semibold">Supabase Credentials Needed</strong>
                <p className="text-amber-800 mt-0.5">
                  Enter your Supabase credentials below or in your <code className="font-mono font-semibold">.env</code> file to activate your cloud database.
                </p>
              </div>
            )}
          </div>
          {isConnected && !isFromEnv && (
            <button
              onClick={handleDisconnect}
              className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition shrink-0"
              title="Disconnect stored credentials"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Connection Form */}
        <form onSubmit={handleSave} className="border border-parchment-200 rounded-xl p-4 bg-parchment-50/50 mb-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-clay-600" />
              <span>Enter Supabase Project Credentials</span>
            </span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-clay-600 hover:text-clay-800 font-semibold"
            >
              Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-parchment-300 rounded-lg font-mono focus:outline-none focus:border-clay-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">
              Anon / Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-parchment-300 rounded-lg font-mono focus:outline-none focus:border-clay-600"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-ink-400">
              Found in: Supabase Dashboard &rarr; <strong>Project Settings</strong> &rarr; <strong>API</strong>.
            </p>
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs px-4 py-2 rounded-lg font-medium shadow-xs transition"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'Connected!' : 'Save & Connect'}</span>
            </button>
          </div>
        </form>

        {/* Database Schema Guide */}
        <div className="space-y-4">
          <div className="border border-parchment-200 rounded-xl p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-clay-700">
                Database Schema (Zero Sample Data)
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                Clean Slate Ready
              </span>
            </div>
            <p className="text-xs text-ink-600 mb-3">
              To create all 17 tables in Supabase with zero mock contracts and zero invoices:
            </p>
            <ol className="text-xs text-ink-700 space-y-1.5 list-decimal list-inside bg-parchment-50 p-3 rounded-lg border border-parchment-200">
              <li>Go to your Supabase Dashboard &rarr; <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>.</li>
              <li>Paste and run <code className="font-mono text-clay-700">supabase/schema.sql</code> (creates tables & permissions).</li>
              <li>Optional: Run <code className="font-mono text-clay-700">supabase/seed.sql</code> to create the initial partnership profile for Subhadip Jana & Shayan Das at 50/50 equity ($0 balance).</li>
            </ol>
            <div className="mt-3 p-2.5 bg-white rounded-lg border border-parchment-200 flex items-center justify-between text-xs font-mono text-ink-700">
              <div className="flex items-center gap-2 truncate">
                <FileCode className="w-4 h-4 text-ink-400 shrink-0" />
                <span className="truncate">supabase/schema.sql</span>
              </div>
              <span className="text-[11px] text-ink-500 font-semibold shrink-0">17 Tables + RLS</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-parchment-200 flex items-center justify-between">
          <div className="text-xs text-ink-500">
            Alternatively, define in <code className="font-mono text-ink-700">.env</code>: <code className="font-mono text-ink-600">VITE_SUPABASE_URL</code> & <code className="font-mono text-ink-600">VITE_SUPABASE_ANON_KEY</code>.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-parchment-200 hover:bg-parchment-300 text-ink-800 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
