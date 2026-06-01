import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

/**
 * Wraps a route element; redirects to "/" if the user's role is not in `allowedRoles`.
 * Usage: <ProtectedRoute allowedRoles={['admin']}><AdminPage /></ProtectedRoute>
 */
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { role, loading } = useRole();

  if (loading) return null; // wait for role fetch

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace state={{ accessDenied: true }} />;
  }

  return children;
}
