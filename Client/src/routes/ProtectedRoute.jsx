import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ThreeDot } from "react-loading-indicators";

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-800 text-2xl">
        <ThreeDot variant="bounce" color="#162D3A" size="medium" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
