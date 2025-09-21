import React, { type ReactNode }  from "react";import AdminSidebar from "./AdminSidebar";
;

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <AdminSidebar />
      </div>

      {/* Page content */}
      <main className="p-6 bg-gray-100 flex-grow">{children}</main>
    </div>
  );
};

export default AdminLayout;