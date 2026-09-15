import React, { useState } from 'react';
import { 
  Plus, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { RolePermissionMatrix } from '../../types/partnership';

export const RoleManagementView: React.FC = () => {
  const { customRoles, addNewRole, currentUser } = useAgency();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const actorLevel = currentUser?.roleLevel || 100;
  // Role giving / assigning permission strictly available to partners (100), admins (80), managers (60)
  const canGrantRoles = actorLevel >= 60;

  const [newRoleForm, setNewRoleForm] = useState<{
    name: string;
    description: string;
    level: number;
    permissions: RolePermissionMatrix;
  }>({
    name: '',
    description: '',
    level: 35,
    permissions: {
      manage_firm_equity: false,
      manage_roles: false,
      manage_contracts: false,
      manage_invoices: false,
      manage_payments: false,
      manage_expenses: false,
      manage_ip: false,
      manage_assets: false,
      manage_debts: false,
      manage_taxes: false,
      manage_team: false,
      manage_clients: false,
      manage_tasks: true,
      create_documents: false,
    }
  });

  const permissionLabels: { key: keyof RolePermissionMatrix; label: string; desc: string }[] = [
    { key: 'manage_firm_equity', label: 'Partnership Equity & Capital', desc: 'Modify capital accounts & deed ownership' },
    { key: 'manage_roles', label: 'Role Administration & RBAC', desc: 'Create roles and delegate permissions' },
    { key: 'manage_contracts', label: 'Client Contracts & MSAs', desc: 'Create, modify, and sign client legal contracts' },
    { key: 'manage_invoices', label: 'Invoices Ledger', desc: 'Issue billing invoices and modify payment items' },
    { key: 'manage_payments', label: 'Payments Reconciliation', desc: 'Record incoming wires and client settlements' },
    { key: 'manage_expenses', label: 'Operating Expenses', desc: 'Log firm expenses and disbursements' },
    { key: 'manage_ip', label: 'IP & Code Ownership Registry', desc: 'Register proprietary code repos vs client work' },
    { key: 'manage_assets', label: 'Fixed Assets & Hardware', desc: 'Track workstations, licenses, and depreciation' },
    { key: 'manage_debts', label: 'Debts & Credit Facilities', desc: 'Manage commercial bank loans & balances' },
    { key: 'manage_taxes', label: 'Statutory Tax Filings', desc: 'Oversee GST, ITR-5, Advance Tax, and TDS' },
    { key: 'manage_team', label: 'Team & User Directory', desc: 'Add or update team members (strictly below own level)' },
    { key: 'manage_clients', label: 'Client Directory & Portals', desc: 'Manage accounts and share portal documents' },
    { key: 'manage_tasks', label: 'Task Allocation & Board', desc: 'Assign deliverables and update sprint milestones' },
    { key: 'create_documents', label: 'Document Generators', desc: 'Generate proposals, quotations, NDAs, & invoices' },
  ];

  const handleOpenCreate = () => {
    setErrorMessage(null);
    setNewRoleForm({
      name: '',
      description: '',
      level: Math.min(actorLevel - 10, 50),
      permissions: {
        manage_firm_equity: false,
        manage_roles: false,
        manage_contracts: false,
        manage_invoices: false,
        manage_payments: false,
        manage_expenses: false,
        manage_ip: false,
        manage_assets: false,
        manage_debts: false,
        manage_taxes: false,
        manage_team: false,
        manage_clients: false,
        manage_tasks: true,
        create_documents: false,
      }
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Strict rule: Level must be strictly less than actorLevel
    if (newRoleForm.level >= actorLevel) {
      setErrorMessage(`Hierarchy Violation: As a Level ${actorLevel} user, you cannot create a role with Level ${newRoleForm.level}. It must be strictly lower.`);
      return;
    }

    const res = await addNewRole(newRoleForm);
    if (res.success) {
      setIsCreateModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Failed to create role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-ink-950">Roles & Permission Matrix</h1>
            <span className="text-xs bg-clay-100 text-clay-800 font-semibold px-2 py-0.5 rounded-full">
              Strict RBAC Hierarchy
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Enforced rule: Users having the same role cannot change or update users with same role or higher. Role delegation is strictly limited downward to Partners (100), Admins (80), and Managers (60).
          </p>
        </div>

        {canGrantRoles && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-clay-600 hover:bg-clay-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Create Custom Role
          </button>
        )}
      </div>

      {/* Hierarchy Rule Notice Card */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Hierarchy Rule Enforcement Active:</strong> You are currently authenticated as <strong>{currentUser?.name || 'Authorized User'}</strong> ({currentUser?.role || 'Member'}, Level {actorLevel}).
          {canGrantRoles ? (
            <span> You have role delegation authority, but can only create, edit, or assign roles with a hierarchy level strictly <strong>below Level {actorLevel}</strong>.</span>
          ) : (
            <span> You are in a contributor or auditor role (Level {actorLevel}) and do not possess role granting permissions. Only Partners (100), Admins (80), and Managers (60) can assign roles.</span>
          )}
        </div>
      </div>

      {/* Roles Cards Stack */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {customRoles.map((role) => {
          return (
            <div
              key={role.id}
              className={`rounded-xl border p-4 flex flex-col justify-between ${
                role.isSystem ? 'bg-white border-parchment-200 shadow-xs' : 'bg-parchment-50 border-clay-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-parchment-100 text-ink-600">
                    Level {role.level}
                  </span>
                  {role.isSystem ? (
                    <span className="text-[9px] text-ink-400 font-semibold uppercase">System</span>
                  ) : (
                    <span className="text-[9px] text-clay-700 font-semibold uppercase">Custom</span>
                  )}
                </div>

                <h3 className="text-base font-serif font-bold capitalize text-ink-950">
                  {role.name}
                </h3>
                <p className="text-[11px] text-ink-500 mt-1 line-clamp-3 leading-snug">
                  {role.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-parchment-200/80">
                <div className="text-[10px] text-ink-400 flex items-center justify-between">
                  <span>Modifiable by:</span>
                  <span className="font-semibold text-ink-700">&gt; Level {role.level}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Permissions Matrix Table */}
      <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-parchment-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-ink-950">Permission Granularity Matrix</h2>
            <p className="text-xs text-ink-500">Live capability mapping across all 10 ledgers and operational modules</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-parchment-50 border-b border-parchment-200 text-xs font-semibold text-ink-600 uppercase">
                <th className="py-3.5 px-4 min-w-[240px]">Permission Area</th>
                {customRoles.map((r) => (
                  <th key={r.id} className="py-3.5 px-3 text-center min-w-[110px]">
                    <div className="font-serif capitalize text-ink-900">{r.name}</div>
                    <div className="text-[10px] text-ink-400 font-mono">Lvl {r.level}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-parchment-100 text-xs">
              {permissionLabels.map((p) => (
                <tr key={p.key} className="hover:bg-parchment-50/50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-ink-900">{p.label}</div>
                    <div className="text-[11px] text-ink-400">{p.desc}</div>
                  </td>
                  {customRoles.map((r) => {
                    const isGranted = r.permissions[p.key];
                    return (
                      <td key={r.id} className="py-3 px-3 text-center">
                        {isGranted ? (
                          <span className="inline-flex p-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded-full bg-slate-50 text-slate-300">
                            <X className="w-3.5 h-3.5 stroke-[2]" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-1">Create Custom Role</h2>
            <p className="text-xs text-ink-500 mb-4">
              Define a tailored role with specific ledger permissions. As Level {actorLevel}, the role level must be strictly &lt; {actorLevel}.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Role Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. tech_lead"
                    value={newRoleForm.name}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">
                    Hierarchy Level (max {actorLevel - 1})
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={actorLevel - 1}
                    value={newRoleForm.level}
                    onChange={(e) => setNewRoleForm({ ...newRoleForm, level: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe scope of responsibility..."
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700 block mb-2">
                  Select Granted Permissions
                </label>
                <div className="space-y-1.5 max-h-56 overflow-y-auto p-3 bg-parchment-50 rounded-lg border border-parchment-200">
                  {permissionLabels.map((p) => {
                    const isChecked = newRoleForm.permissions[p.key];
                    return (
                      <label key={p.key} className="flex items-center justify-between text-xs text-ink-800 p-1 hover:bg-parchment-100 rounded cursor-pointer">
                        <div>
                          <div className="font-medium">{p.label}</div>
                          <div className="text-[10px] text-ink-400">{p.desc}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            setNewRoleForm({
                              ...newRoleForm,
                              permissions: {
                                ...newRoleForm.permissions,
                                [p.key]: e.target.checked
                              }
                            });
                          }}
                          className="rounded text-clay-600 focus:ring-clay-500"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-ink-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
