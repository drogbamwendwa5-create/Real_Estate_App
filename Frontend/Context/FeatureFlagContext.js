import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSuperAdminFeatureFlags } from '../Services/api';

const FeatureFlagContext = createContext();

export const FeatureFlagProvider = ({ children }) => {
  const [flags, setFlags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminFeatureFlags();
      setFlags(data?.data || data || {});
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const isEnabled = (flagName) => {
    return flags[flagName] === true;
  };

  const value = {
    flags,
    loading,
    error,
    isEnabled,
    refreshFlags: loadFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagContext);