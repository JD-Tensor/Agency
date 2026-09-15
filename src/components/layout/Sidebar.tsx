import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Files, 
  Settings, 
  Users, 
  CheckSquare, 
  FileText, 
  ShieldCheck, 
  Receipt, 
  Building2,
  PieChart,
  Lock,
  Laptop,
  FileCheck2,
  Scale
} from 'lucide-react';
import { useAgency, AppView } from '../../context/AgencyContext';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    agencyProfile, 
    currentUser
  } = useAgency();

  const isClient = currentUser?.accessLevel === 'client';
  const isContributor = currentUser?.accessLevel === 'contributor' || currentUser?.accessLevel === 'restricted';

  // Partnership firm ledger items
  const partnershipLedgers: { view: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { view: 'partnership_hub', label: 'Partnership Hub', icon: Scale, badge: 'Overview' },
    { view: 'contracts_ledger', label: '1. Client Contracts', icon: FileText },
    { view: 'financial_ledgers', label: '2-4. Financial Ledgers', icon: Receipt },
    { view: 'capital_equity', label: '5-6. Capital & Equity', icon: PieChart },
    { view: 'ip_registry', label: '7. IP & Code Ownership', icon: Lock },
    { view: 'assets_debts', label: '8-9. Assets & Debts', icon: Laptop },
    { view: 'tax_filings', label: '10. Tax Filings', icon: FileCheck2 },
    { view: 'roles_matrix', label: 'Roles & RBAC', icon: ShieldCheck, badge: 'Hierarchy' },
  ];

  // Core operations navigation
  const operationsNav: { view: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { view: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { view: 'hub', label: 'Document Generators', icon: FilePlus2 },
    { view: 'tasks', label: 'Task Allocation', icon: CheckSquare },
    { view: 'clients', label: 'Clients & Portals', icon: Building2 },
    { view: 'freelancers', label: 'Team & Directory', icon: Users },
    { view: 'library', label: 'Document Archive', icon: Files },
    { view: 'settings', label: 'Agency Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-parchment-50 border-r border-parchment-200 flex flex-col h-screen select-none no-print">
      <div className="overflow-y-auto flex-1">
        {/* Brand Header */}
        <div className="p-4 border-b border-parchment-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-clay-600 to-clay-800 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
              {agencyProfile.name.charAt(0)}
            </div>
            <div>
              <div className="font-serif text-sm font-bold text-ink-950 tracking-tight leading-tight truncate w-36">
                {agencyProfile.name}
              </div>
              <div className="text-[10px] text-ink-500 font-semibold tracking-wide uppercase">
                Partnership Firm
              </div>
            </div>
          </div>
        </div>

        {/* Current User Role Pill */}
        <div className="px-4 py-2 bg-parchment-100/70 border-b border-parchment-200/60 flex items-center justify-between">
          <div className="truncate">
            <div className="text-xs font-semibold text-ink-900 truncate">{currentUser?.name || 'User'}</div>
            <div className="text-[10px] text-ink-500 truncate capitalize">{currentUser?.role || 'Active User'}</div>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-clay-100 text-clay-800 font-bold">
            Lvl {currentUser?.roleLevel || 100}
          </span>
        </div>

        {/* Partnership Firm Ledgers Navigation */}
        {!isClient && (
          <div className="p-3">
            <div className="text-[10px] uppercase font-bold text-clay-700 tracking-wider px-2 mb-1 flex items-center justify-between">
              <span>Partnership Ledgers</span>
              <span className="text-[9px] bg-clay-100 px-1 py-0.2 rounded text-clay-800 font-mono">10 Ledgers</span>
            </div>
            <nav className="space-y-0.5">
              {partnershipLedgers.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-clay-100 text-clay-900 font-semibold shadow-xs'
                        : 'text-ink-700 hover:bg-parchment-200/60 hover:text-ink-950'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-clay-700' : 'text-ink-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] bg-parchment-200 text-ink-600 px-1.5 py-0.2 rounded font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Operations & Delivery Navigation */}
        <div className="p-3 pt-1 border-t border-parchment-200/60">
          <div className="text-[10px] uppercase font-bold text-ink-400 tracking-wider px-2 mb-1">
            Operations & Work
          </div>
          <nav className="space-y-0.5">
            {isClient ? (
              <button
                onClick={() => setCurrentView('client_portal')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold bg-clay-50 text-clay-700"
              >
                <Building2 className="w-4 h-4 text-clay-600" />
                <span>Client Portal</span>
              </button>
            ) : isContributor ? (
              <>
                <button
                  onClick={() => setCurrentView('my_workspace')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                    currentView === 'my_workspace' ? 'bg-clay-50 text-clay-700' : 'text-ink-700 hover:bg-parchment-200/50'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-clay-600" />
                  <span>My Tasks & Work</span>
                </button>
                <button
                  onClick={() => setCurrentView('library')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold ${
                    currentView === 'library' ? 'bg-clay-50 text-clay-700' : 'text-ink-700 hover:bg-parchment-200/50'
                  }`}
                >
                  <Files className="w-4 h-4 text-clay-600" />
                  <span>Document Archive</span>
                </button>
              </>
            ) : (
              operationsNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setCurrentView(item.view)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-clay-100 text-clay-900 font-semibold shadow-xs'
                        : 'text-ink-700 hover:bg-parchment-200/60 hover:text-ink-950'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-clay-700' : 'text-ink-500'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })
            )}
          </nav>
        </div>
      </div>
    </aside>
  );
};
