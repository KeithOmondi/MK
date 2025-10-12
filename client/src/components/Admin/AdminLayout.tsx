import React, { type ReactNode } from "react";
// Assuming these imports work correctly
import { SidebarProvider, useSidebar } from "./Context/SidebarContext";
import AdminHeader from "./Layout/AdminHeader";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

// --- Layout Content Component (The area next to the sidebar) ---
const LayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
  const { collapsed } = useSidebar();

  // Define transition classes
  const baseMargin = "md:ml-20"; // Margin when sidebar is collapsed (20 units wide)
  const expandedMargin = "md:ml-64"; // Margin when sidebar is open (64 units wide)

  return (
    <div
      className={`
        flex flex-col flex-grow min-h-screen 
        bg-gray-100 text-gray-800 
        transition-all duration-300 ease-in-out
        w-full 
        ${collapsed ? baseMargin : expandedMargin}
      `}
    >
      {/* The header is now fixed and provides visual separation */}
      <AdminHeader />
      
      {/* Main content area with uniform, professional padding */}
      <main className="flex-grow p-6 md:p-8 lg:p-10 overflow-x-hidden">
        <div className="bg-white rounded-xl shadow-lg min-h-[calc(100vh-140px)] p-6 md:p-8">
            {children}
        </div>
      </main>
      
      {/* Optional: Add a simple footer here if needed */}
      {/* <footer className="p-4 text-center text-xs text-gray-500 border-t border-gray-200">
        &copy; {new Date().getFullYear()} Admin Dashboard.
      </footer> */}
    </div>
  );
};

// --- Main Admin Layout Component ---
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex relative">
        {/* Sidebar is fixed on the left */}
        <AdminSidebar />
        
        {/* Content area adapts its left margin based on sidebar state */}
        <LayoutContent>{children}</LayoutContent>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;