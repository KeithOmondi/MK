import React, { type ReactNode } from "react";
import { SidebarProvider, useSidebar } from "./Context/SidebarContext";
import AdminHeader from "./Layout/AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const LayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const { collapsed } = useSidebar();

  return (
    <div
      className={`flex flex-col min-h-screen bg-gray-50 text-gray-800 transition-all duration-300 ease-in-out ${
        collapsed ? "md:ml-20" : "md:ml-64"
      }`}
    >
      <AdminHeader />
      <main className="flex-grow p-6 overflow-y-auto">{children}</main>
    </div>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex">
        <AdminSidebar />
        <LayoutContent>{children}</LayoutContent>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
