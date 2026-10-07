import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AgencyProvider, useAgency } from './context/AgencyContext';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { DocumentHub } from './components/documents/DocumentHub';
import { DocumentEditor } from './components/documents/DocumentEditor';
import { DocumentList } from './components/documents/DocumentList';
import { FreelancerDirectory } from './components/freelancers/FreelancerDirectory';
import { TaskManagementBoard } from './components/tasks/TaskManagementBoard';
import { FreelancerWorkspace } from './components/freelancers/FreelancerWorkspace';
import { ClientPortal } from './components/client/ClientPortal';
import { ClientManagementDirectory } from './components/clients/ClientManagementDirectory';
import { AgencySettings } from './components/settings/AgencySettings';
import { LoginModal } from './components/auth/LoginModal';

import { PartnershipHub } from './components/partnership/PartnershipHub';
import { ContractsLedger } from './components/partnership/ContractsLedger';
import { FinancialLedgerView } from './components/partnership/FinancialLedgerView';
import { CapitalEquityView } from './components/partnership/CapitalEquityView';
import { IpRegistryView } from './components/partnership/IpRegistryView';
import { AssetsDebtsView } from './components/partnership/AssetsDebtsView';
import { TaxFilingsView } from './components/partnership/TaxFilingsView';
import { RoleManagementView } from './components/roles/RoleManagementView';

import { LoginPage } from './components/auth/LoginPage';
import { InquiriesView } from './components/inquiries/InquiriesView';
import { LandingPage } from './components/landing/LandingPage';

const AppContentViews: React.FC = () => {
  const { currentView, editingDocument } = useAgency();

  switch (currentView) {
    case 'partnership_hub':
      return <PartnershipHub />;
    case 'contracts_ledger':
      return <ContractsLedger />;
    case 'financial_ledgers':
      return <FinancialLedgerView />;
    case 'capital_equity':
      return <CapitalEquityView />;
    case 'ip_registry':
      return <IpRegistryView />;
    case 'assets_debts':
      return <AssetsDebtsView />;
    case 'tax_filings':
      return <TaxFilingsView />;
    case 'roles_matrix':
      return <RoleManagementView />;
    case 'dashboard':
      return <DashboardOverview />;
    case 'hub':
      return <DocumentHub />;
    case 'editor':
      return <DocumentEditor key={editingDocument?.id} />;
    case 'library':
      return <DocumentList />;
    case 'freelancers':
      return <FreelancerDirectory />;
    case 'clients':
      return <ClientManagementDirectory />;
    case 'tasks':
      return <TaskManagementBoard />;
    case 'my_workspace':
      return <FreelancerWorkspace />;
    case 'client_portal':
      return <ClientPortal />;
    case 'inquiries':
      return <InquiriesView />;
    case 'settings':
      return <AgencySettings />;
    default:
      return <PartnershipHub />;
  }
};

const AppRouter: React.FC = () => {
  const { currentUser, authLoading } = useAgency();

  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-[#fbf9f5] flex items-center justify-center text-xs text-ink-500">
        Restoring session...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/admin/login" 
        element={currentUser ? <Navigate to="/admin" replace /> : <LoginPage />} 
      />
      <Route 
        path="/admin/*" 
        element={
          currentUser ? (
            <>
              <MainLayout><AppContentViews /></MainLayout>
              <LoginModal />
            </>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export function App() {
  return (
    <AgencyProvider>
      <AppRouter />
    </AgencyProvider>
  );
}

export default App;
