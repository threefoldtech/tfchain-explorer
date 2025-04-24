import { ApiPromise, WsProvider } from '@polkadot/api';
import { useState, useEffect } from 'react';

// Default endpoints for Substrate nodes
export const SUBSTRATE_ENDPOINTS = {
  // TFChain endpoints
  tfchain_dev: 'wss://tfchain.dev.grid.tf',
  tfchain_qa: 'wss://tfchain.qa.grid.tf',
  tfchain_test: 'wss://tfchain.test.grid.tf',
  tfchain_prod: 'wss://tfchain.grid.tf',
};

// Create a singleton API instance
let api: ApiPromise | null = null;

export const connectToSubstrate = async (endpoint: string): Promise<ApiPromise> => {
  if (api) {
    await api.disconnect();
    api = null;
  }

  const provider = new WsProvider(endpoint);
  api = await ApiPromise.create({ provider });
  return api;
};

export const getApi = (): ApiPromise | null => {
  return api;
};

// Custom hook for using the Substrate API
export const useSubstrateApi = (endpoint: string = SUBSTRATE_ENDPOINTS.polkadot) => {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const connect = async () => {
      try {
        const api = await connectToSubstrate(endpoint);
        
        // Subscribe to connection status
        unsubscribe = api.on('connected', () => {
          setIsConnected(true);
          setError(null);
        });
        
        api.on('disconnected', () => {
          setIsConnected(false);
        });
        
        api.on('error', (error) => {
          setError(error);
        });
        
        setApi(api);
        setIsConnected(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      
      if (api) {
        api.disconnect().catch(console.error);
      }
    };
  }, [endpoint]);

  return { api, isConnected, error };
};
