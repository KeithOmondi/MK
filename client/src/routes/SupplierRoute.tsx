// src/routes/SupplierRoute.tsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "../redux/store";

interface SupplierRouteProps {
  children: React.ReactNode;
}

const SupplierRoute: React.FC<SupplierRouteProps> = ({ children }) => {
  // ✅ Select only what you need
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);

  // Not logged in
  if (!accessToken || !user) {
    return <Navigate to="/login" replace />;
  }

  // Not a Supplier
  if (user.role !== "Supplier") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default SupplierRoute;
