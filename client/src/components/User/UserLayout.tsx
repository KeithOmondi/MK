import React, { type ReactNode }  from "react";
import UserSidebar from "./UserSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const UserLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64">
        <UserSidebar />
      </div>

      {/* Page content */}
      <main className="p-6 bg-gray-100 flex-grow">{children}</main>
    </div>
  );
};

export default UserLayout;
