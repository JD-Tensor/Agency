import React, { useRef } from 'react';
import { 
  Download, 
  Upload, 
  KeyRound,
  LogOut
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { CurrencyToggle } from '../common/CurrencyToggle';

export const Topbar: React.FC = () => {
  const { 
    currentView, 
    exportDataJson, 
    importDataJson,
    currentUser,
    setLoginModalOpen,
    setCurrentView,
    logout,
    activeCurrency,
    setActiveCurrency
  } = useAgency();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.accessLevel === 'admin';

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Agency Overview & Business Hub', subtitle: 'Real-time monitoring of agency documents, revenue, and active client papers' },
    hub: { title: 'Document Generators', subtitle: 'Select a standardized business document template to customize and export' },
    editor: { title: 'Document Studio', subtitle: 'Edit details in real-time with live A4 preview and instant PDF export' },
    library: { title: 'Document Archive & History', subtitle: 'Inspect, edit, clone, or re-download any previously issued document' },
    freelancers: { title: 'Freelancer Directory & Credentials', subtitle: 'Onboard new joiners, generate login credentials, and manage access levels' },
    clients: { title: 'Client Accounts & Portal Management', subtitle: 'Onboard clients, allocate project leads, generate portal credentials, and track orders' },
    tasks: { title: 'Task Allocation & Kanban Board', subtitle: 'Assign milestones to freelancers, monitor due dates, and review deliverables' },
    my_workspace: { title: 'My Freelancer Workspace', subtitle: 'Track your assigned deliverables, update work progress, and submit completions' },
    client_portal: { title: 'Client Portal & Project Delivery', subtitle: 'Monitor real-time delivery milestones, assigned leads, invoices, and shared papers' },
    settings: { title: 'Agency Settings & Profile', subtitle: 'Configure default agency branding, tax details, bank info, and authorized signers' },
  };

  const currentMeta = viewTitles[currentView] || { title: 'Agency Workspace', subtitle: '' };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importDataJson(content);
        if (success) {
          alert('Backup restored successfully!');
        } else {
          alert('Failed to parse backup JSON file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="h-16 border-b border-parchment-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between no-print z-20">
      <div>
        <h1 className="font-serif text-lg text-ink-950 font-normal leading-tight">
          {currentMeta.title}
        </h1>
        <p className="text-[11px] text-ink-500 font-light">
          {currentMeta.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Hidden File Input for Data Restore */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".json" 
          className="hidden" 
        />

        {/* Global Currency Toggle (USD <-> INR) */}
        <div className="flex items-center">
          <CurrencyToggle
            value={activeCurrency}
            onChange={setActiveCurrency}
            size="sm"
            showRateNotice={true}
          />
        </div>

        {/* Data Backup / Restore Buttons (Only for Admin) */}
        {isAdmin && (
          <div className="hidden sm:flex items-center gap-1 bg-parchment-100 p-1 rounded-lg border border-parchment-200 text-xs">
            <button
              onClick={exportDataJson}
              title="Download JSON data backup"
              className="flex items-center gap-1.5 px-2.5 py-1 text-ink-700 hover:text-ink-950 hover:bg-white rounded transition text-[11px] font-medium"
            >
              <Download className="w-3.5 h-3.5 text-ink-500" />
              <span>Backup</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Restore from JSON data backup"
              className="flex items-center gap-1.5 px-2.5 py-1 text-ink-700 hover:text-ink-950 hover:bg-white rounded transition text-[11px] font-medium"
            >
              <Upload className="w-3.5 h-3.5 text-ink-500" />
              <span>Restore</span>
            </button>
          </div>
        )}

        {/* User Account Button & Session State */}
        <div className="flex items-center gap-2 pl-3 border-l border-parchment-200">
          <button 
            onClick={() => setCurrentView('settings')}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-parchment-100 transition text-left"
            title="Account Settings & Security"
          >
            <div className="w-7 h-7 rounded-full bg-clay-100 text-clay-800 flex items-center justify-center font-bold text-[11px] border border-clay-200">
              {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-medium leading-tight truncate max-w-[130px]">{currentUser?.name || 'Authorized User'}</div>
              <div className="text-[9px] uppercase font-bold text-clay-700">{currentUser?.accessLevel?.replace('_', ' ') || 'ACTIVE'}</div>
            </div>
          </button>

          <button
            onClick={() => setLoginModalOpen(true)}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-parchment-100 transition"
            title="Switch credentials / sign in"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50 transition ml-0.5"
            title="Log Out of Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
