import React, { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext({ role: 'worker', isAdmin: false, isManager: false, isWorker: true });

export function RoleProvider({ userEmail, children }) {
  const [role, setRole] = useState('worker');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) { setLoading(false); return; }
    fetch(`/api/my-role?email=${encodeURIComponent(userEmail)}`)
      .then(r => r.json())
      .then(data => setRole(data.role || 'worker'))
      .catch(() => setRole('worker'))
      .finally(() => setLoading(false));
  }, [userEmail]);

  const value = {
    role,
    setRole,
    isAdmin: role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    isWorker: role === 'worker',
    loading,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
