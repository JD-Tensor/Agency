import React from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileCode,
  X
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseUrl } from '../../services/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseMigrationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isConnected = isSupabaseConfigured();

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
                Supabase Cloud Database
              </h2>
              <p className="text-xs text-ink-500">
                All firm data and sign-ins run on Supabase Postgres and Supabase Auth.
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
                <strong className="text-sm font-semibold">Connected</strong>
                <p className="text-emerald-800 mt-0.5">
                  Project: <span className="font-mono font-medium">{getSupabaseUrl()}</span> (from .env)
                </p>
              </div>
            ) : (
              <div>
                <strong className="text-sm font-semibold">Supabase Credentials Needed</strong>
                <p className="text-amber-800 mt-0.5">
                  Set <code className="font-mono font-semibold">VITE_SUPABASE_URL</code> and <code className="font-mono font-semibold">VITE_SUPABASE_ANON_KEY</code> in <code className="font-mono font-semibold">.env</code>, then restart the dev server.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Setup Guide */}
        <div className="border border-parchment-200 rounded-xl p-4 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-clay-700">
              Project Setup
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
          <ol className="text-xs text-ink-700 space-y-1.5 list-decimal list-inside bg-parchment-50 p-3 rounded-lg border border-parchment-200">
            <li>SQL Editor: run <code className="font-mono text-clay-700">supabase/schema.sql</code>, then <code className="font-mono text-clay-700">supabase/seed.sql</code>.</li>
            <li>Authentication &rarr; Sign In / Providers: turn off <strong>Allow new users to sign up</strong>.</li>
            <li>Authentication &rarr; Users &rarr; <strong>Add user</strong> for each partner email, with <strong>Auto Confirm</strong> on.</li>
            <li>Deploy the account service: <code className="font-mono text-clay-700">npx supabase functions deploy admin-users</code>.</li>
          </ol>
          <div className="mt-3 p-2.5 bg-white rounded-lg border border-parchment-200 flex items-center justify-between text-xs font-mono text-ink-700">
            <div className="flex items-center gap-2 truncate">
              <FileCode className="w-4 h-4 text-ink-400 shrink-0" />
              <span className="truncate">supabase/schema.sql</span>
            </div>
            <span className="text-[11px] text-ink-500 font-semibold shrink-0">17 Tables + RLS</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-parchment-200 flex justify-end">
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
