import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDuscoAuth } from "@/lib/DuscoAuthContext";

export default function DuscoProtectedRoute({ children }) {
  const { isAuthenticated } = useDuscoAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children || <Outlet />;
}