import { useState, useEffect } from 'react';
import { ApiPromise } from '@polkadot/api';
import { AccountData } from '../types';

export const useAccount = (api: ApiPromise | null, address: string | null) => {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!api || !api.isConnected || !address) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const fetchAccount = async () => {
      try {
        setLoading(true);
        
        // Subscribe to account info changes
        unsubscribe = await api.query.system.account(address, (accountInfo: any) => {
          const { data: balance, nonce } = accountInfo;
          
          const accountData: AccountData = {
            address,
            balance: balance.free.toString(),
            nonce: nonce.toString(),
            freeBalance: balance.free.toString(),
            reservedBalance: balance.reserved.toString(),
            lockedBalance: balance.frozen ? balance.frozen.toString() : '0',
          };
          
          setAccount(accountData);
          setError(null);
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setAccount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api, address]);

  return { account, loading, error };
};
