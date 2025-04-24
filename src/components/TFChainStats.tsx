import React, { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { useApi } from '../api/ApiContext';
import { TFGridStats } from '../types';

const TFChainStats: React.FC = () => {
  const { api } = useApi();
  const [stats, setStats] = useState<TFGridStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchStats = async () => {
      if (!api || !api.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // For TFChain, we need to get the counts from the storage values
        // that track the current ID counters

        // Get nodes count by getting the current node ID counter
        const nodeCount = await api.query.tfgridModule.nodeID();
        
        // Get farms count by getting the current farm ID counter
        const farmCount = await api.query.tfgridModule.farmID();
        
        // Get twins count by getting the current twin ID counter
        const twinCount = await api.query.tfgridModule.twinID();
        
        // Get contracts count by getting the current contract ID counter
        const contractCount = await api.query.smartContractModule.contractID();
        
        // For public IPs, we'll use a placeholder since there's no direct counter
        // In a real implementation, we would need to iterate through all farms
        const publicIpCount = await api.query.tfgridModule.farmID(); // Using farm count as fallback

        if (nodeCount && farmCount && twinCount && contractCount && publicIpCount) {
          // Handle Codec type properly by using toString and parseInt
          setStats({
            totalNodes: parseInt(nodeCount.toString()),
            totalFarms: parseInt(farmCount.toString()),
            totalTwins: parseInt(twinCount.toString()),
            totalContracts: parseInt(contractCount.toString()),
            totalPublicIps: parseInt(publicIpCount.toString()),
          });
        } else {
          console.error('Some TFChain modules not found');
          setError(new Error('Some TFChain modules not found. Make sure you are connected to a TFChain node.'));
        }
        
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

  if (loading) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={4}>TFChain Grid Statistics</Heading>
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <Spinner size="xl" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={4}>TFChain Grid Statistics</Heading>
        <Text color="red.500">Error loading TFChain stats: {error.message}</Text>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={4}>TFChain Grid Statistics</Heading>
        <Text>No data available</Text>
      </Box>
    );
  }

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
      <Heading size="md" mb={4}>TFChain Grid Statistics</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
        <Stat p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <StatLabel>Nodes</StatLabel>
          <StatNumber>{stats.totalNodes.toLocaleString()}</StatNumber>
          <StatHelpText>Total Grid Nodes</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <StatLabel>Farms</StatLabel>
          <StatNumber>{stats.totalFarms.toLocaleString()}</StatNumber>
          <StatHelpText>Total Grid Farms</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <StatLabel>Twins</StatLabel>
          <StatNumber>{stats.totalTwins.toLocaleString()}</StatNumber>
          <StatHelpText>Total Digital Twins</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <StatLabel>Contracts</StatLabel>
          <StatNumber>{stats.totalContracts.toLocaleString()}</StatNumber>
          <StatHelpText>Total Smart Contracts</StatHelpText>
        </Stat>
        <Stat p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
          <StatLabel>Public IPs</StatLabel>
          <StatNumber>{stats.totalPublicIps.toLocaleString()}</StatNumber>
          <StatHelpText>Total Public IP Addresses</StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
};

export default TFChainStats;
