import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-parchment-100 print:h-auto print:overflow-visible print:bg-white print:block">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:h-auto print:overflow-visible print:block">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-parchment-100/60 p-6 print:p-0 print:m-0 print:h-auto print:overflow-visible print:bg-white print:block">
          {children}
        </main>
      </div>
    </div>
  );
};

