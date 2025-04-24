import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useSubstrateApi, SUBSTRATE_ENDPOINTS } from './substrate';
import { ApiContextType } from '../types';

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [endpoint, setEndpoint] = useState<string>(SUBSTRATE_ENDPOINTS.tfchain_dev);
  const { api, isConnected, error } = useSubstrateApi(endpoint);

  return (
    <ApiContext.Provider value={{ api, isConnected, error, endpoint, setEndpoint }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};
