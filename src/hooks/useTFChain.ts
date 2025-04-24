import { useState, useEffect } from 'react';
import { ApiPromise } from '@polkadot/api';
import { TFGridFarm, TFGridNode, TFGridTwin, TFGridStats } from '../types';

export const useTFChainStats = (api: ApiPromise | null) => {
  const [stats, setStats] = useState<TFGridStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!api || !api.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch total nodes count
        const nodesCount = await api.query.tfgridModule.nodeCount();
        
        // Fetch total farms count
        const farmsCount = await api.query.tfgridModule.farmCount();
        
        // Fetch total twins count
        const twinsCount = await api.query.tfgridModule.twinCount();
        
        // Fetch total contracts count
        const contractsCount = await api.query.smartContractModule.contractsCount();
        
        // Fetch total public IPs
        const publicIpsCount = await api.query.tfgridModule.publicIpCount();

        setStats({
          totalNodes: nodesCount.toNumber(),
          totalFarms: farmsCount.toNumber(),
          totalTwins: twinsCount.toNumber(),
          totalContracts: contractsCount.toNumber(),
          totalPublicIps: publicIpsCount.toNumber(),
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching TFChain stats:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Set up subscription for new blocks to refresh data
    let unsub: (() => void) | undefined;
    
    const subscribeToBlocks = async () => {
      if (api && api.isConnected) {
        try {
          unsub = await api.rpc.chain.subscribeNewHeads(() => {
            fetchStats();
          });
        } catch (err) {
          console.error('Error subscribing to new blocks:', err);
        }
      }
    };
    
    subscribeToBlocks();
    
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [api]);

  return { stats, loading, error };
};

export const useTFChainFarms = (api: ApiPromise | null) => {
  const [farms, setFarms] = useState<TFGridFarm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFarms = async () => {
      if (!api || !api.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get farm count
        const farmCount = await api.query.tfgridModule.farmCount();
        const farmIds = Array.from({ length: farmCount.toNumber() }, (_, i) => i + 1);
        
        // Fetch all farms
        const farmPromises = farmIds.map(id => api.query.tfgridModule.farms(id));
        const farmResults = await Promise.all(farmPromises);
        
        // Process farm data
        const processedFarms = farmResults
          .map((farm, index) => {
            const farmData = farm.unwrapOr(null);
            if (!farmData) return null;
            
            return {
              id: index + 1,
              farmId: farmData.id.toNumber(),
              name: farmData.name.toString(),
              twinId: farmData.twinId.toNumber(),
              pricingPolicyId: farmData.pricingPolicyId.toNumber(),
              certificationType: farmData.certificationType.toString(),
              publicIps: farmData.publicIps.toArray(),
            };
          })
          .filter((farm): farm is TFGridFarm => farm !== null);
        
        setFarms(processedFarms);
        setError(null);
      } catch (err) {
        console.error('Error fetching TFChain farms:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
    
    // Subscribe to new blocks to refresh data
    let unsub: (() => void) | undefined;
    
    const subscribeToBlocks = async () => {
      if (api && api.isConnected) {
        try {
          unsub = await api.rpc.chain.subscribeNewHeads(() => {
            fetchFarms();
          });
        } catch (err) {
          console.error('Error subscribing to new blocks:', err);
        }
      }
    };
    
    subscribeToBlocks();
    
    return () => {
      if (unsub) {
        unsub();
      }
    };
  }, [api]);

  return { farms, loading, error };
};

export const useTFChainNodes = (api: ApiPromise | null) => {
  const [nodes, setNodes] = useState<TFGridNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNodes = async () => {
      if (!api || !api.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get node count
        const nodeCount = await api.query.tfgridModule.nodeCount();
        const nodeIds = Array.from({ length: nodeCount.toNumber() }, (_, i) => i + 1);
        
        // Fetch all nodes (limit to 100 for performance)
        const limitedNodeIds = nodeIds.slice(0, 100);
        const nodePromises = limitedNodeIds.map(id => api.query.tfgridModule.nodes(id));
        const nodeResults = await Promise.all(nodePromises);
        
        // Process node data
        const processedNodes = nodeResults
          .map((node, index) => {
            const nodeData = node.unwrapOr(null);
            if (!nodeData) return null;
            
            return {
              id: limitedNodeIds[index],
              nodeId: nodeData.id.toNumber(),
              farmId: nodeData.farmId.toNumber(),
              twinId: nodeData.twinId.toNumber(),
              resources: {
                hru: nodeData.resources.hru.toString(),
                sru: nodeData.resources.sru.toString(),
                cru: nodeData.resources.cru.toString(),
                mru: nodeData.resources.mru.toString(),
              },
              location: {
                country: nodeData.location.country.toString(),
                city: nodeData.location.city.toString(),
                latitude: nodeData.location.latitude.toString(),
                longitude: nodeData.location.longitude.toString(),
              },
              status: nodeData.status.toString(),
              certificationType: nodeData.certificationType.toString(),
            };
          })
          .filter((node): node is TFGridNode => node !== null);
        
        setNodes(processedNodes);
        setError(null);
      } catch (err) {
        console.error('Error fetching TFChain nodes:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchNodes();
    
    // Subscribe to new blocks to refresh data periodically (not on every block for performance)
    const interval = setInterval(() => {
      if (api && api.isConnected) {
        fetchNodes();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [api]);

  return { nodes, loading, error };
};

export const useTFChainTwins = (api: ApiPromise | null) => {
  const [twins, setTwins] = useState<TFGridTwin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTwins = async () => {
      if (!api || !api.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get twin count
        const twinCount = await api.query.tfgridModule.twinCount();
        const twinIds = Array.from({ length: twinCount.toNumber() }, (_, i) => i + 1);
        
        // Fetch all twins (limit to 100 for performance)
        const limitedTwinIds = twinIds.slice(0, 100);
        const twinPromises = limitedTwinIds.map(id => api.query.tfgridModule.twins(id));
        const twinResults = await Promise.all(twinPromises);
        
        // Process twin data
        const processedTwins = twinResults
          .map((twin, index) => {
            const twinData = twin.unwrapOr(null);
            if (!twinData) return null;
            
            return {
              id: limitedTwinIds[index],
              twinId: twinData.id.toNumber(),
              accountId: twinData.accountId.toString(),
              ip: twinData.ip.toString(),
            };
          })
          .filter((twin): twin is TFGridTwin => twin !== null);
        
        setTwins(processedTwins);
        setError(null);
      } catch (err) {
        console.error('Error fetching TFChain twins:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchTwins();
    
    // Subscribe to new blocks to refresh data periodically (not on every block for performance)
    const interval = setInterval(() => {
      if (api && api.isConnected) {
        fetchTwins();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [api]);

  return { twins, loading, error };
};
