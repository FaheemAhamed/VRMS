import React from "react";
import { Navigate } from "react-router-dom";

// ProtectedRoute checks if a JWT token exists in localStorage.
// If yes -> renders the requested child component.
// If no  -> redirects to "/login" using <Navigate />.
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // To support Role Based Access Control, we can optionally parse the token or use a state
  // But for simple checking, we just ensure a token exists as per user request.

  return children;
};

export default ProtectedRoute;
