import { useState, useEffect } from 'react';
import { ApiPromise } from '@polkadot/api';
import { NetworkInfo } from '../types';

export const useNetworkInfo = (api: ApiPromise | null) => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!api || !api.isConnected) {
      setLoading(false);
      return;
    }

    const fetchNetworkInfo = async () => {
      try {
        setLoading(true);
        
        // Get chain properties
        const [
          chainName,
          chainProperties,
          systemChain,
          systemChainType,
        ] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.properties(),
          api.rpc.system.chain(),
          api.rpc.system.chainType ? api.rpc.system.chainType() : { isLive: true, isLocal: false, isDevelopment: false },
        ]);
        
        // Determine chain type
        let chainType = 'Unknown';
        if (systemChainType.isLive) chainType = 'Live';
        if (systemChainType.isLocal) chainType = 'Local';
        if (systemChainType.isDevelopment) chainType = 'Development';
        
        // Extract token information
        const tokenSymbol = chainProperties.tokenSymbol.isNone
          ? 'UNIT'
          : chainProperties.tokenSymbol.value.toString();
        
        const tokenDecimals = chainProperties.tokenDecimals.isNone
          ? 12
          : chainProperties.tokenDecimals.value[0].toNumber();
        
        const ss58Format = chainProperties.ss58Format.isNone
          ? 42
          : chainProperties.ss58Format.value.toNumber();
        
        setNetworkInfo({
          name: systemChain.toString(),
          tokenSymbol,
          tokenDecimals,
          ss58Format,
          genesisHash: api.genesisHash.toHex(),
          chainType,
        });
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setNetworkInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();
  }, [api]);

  return { networkInfo, loading, error };
};
