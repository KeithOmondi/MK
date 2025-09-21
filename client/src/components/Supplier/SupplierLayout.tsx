import React, { type ReactNode }  from "react";
import SupplierSidebar from "./SupplierSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const SupplierLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <SupplierSidebar />
      </div>

      {/* Page content */}
      <main className="p-6 bg-gray-100 flex-grow">{children}</main>
    </div>
  );
};

export default SupplierLayout;
