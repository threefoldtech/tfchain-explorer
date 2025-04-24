import React, { useState, useEffect } from 'react';
import { Box, Text, Heading, Spinner, Table, Thead, Tbody, Tr, Th, Td, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../api/ApiContext';

const TFGridInfo: React.FC = () => {
  const { api, isConnected } = useApi();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmCount, setFarmCount] = useState<number | null>(null);
  const [nodeCount, setNodeCount] = useState<number | null>(null);
  const [twinCount, setTwinCount] = useState<number | null>(null);

  useEffect(() => {
    if (!api || !isConnected) {
      setLoading(false);
      return;
    }

    const fetchTFGridInfo = async () => {
      try {
        setLoading(true);
        
        // Check if TFGrid module exists
        const hasTFGridPallet = api.query.tfgridModule !== undefined;
        
        if (!hasTFGridPallet) {
          setError('TFGrid pallet not found in this chain');
          setLoading(false);
          return;
        }
        
        // Fetch counts from storage using the correct ID storage values
        const [farmID, nodeID, twinID] = await Promise.all([
          api.query.tfgridModule.farmID(),
          api.query.tfgridModule.nodeID(),
          api.query.tfgridModule.twinID(),
        ]);
        
        // Parse the counter values safely
        setFarmCount(parseInt(farmID.toString()));
        setNodeCount(parseInt(nodeID.toString()));
        setTwinCount(parseInt(twinID.toString()));
        
        setError(null);
      } catch (err) {
        console.error('Error fetching TFGrid info:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchTFGridInfo();
  }, [api, isConnected]);

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Heading size="md" mb={4}>TFGrid Information</Heading>
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Heading size="md" mb={4}>TFGrid Information</Heading>
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Heading size="md" mb={4}>TFGrid Information</Heading>
      
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Resource</Th>
            <Th isNumeric>Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>
              <Link as={RouterLink} to="/tfgrid/farms" color="blue.500">
                Farms
              </Link>
            </Td>
            <Td isNumeric>{farmCount}</Td>
          </Tr>
          <Tr>
            <Td>
              <Link as={RouterLink} to="/tfgrid/nodes" color="blue.500">
                Nodes
              </Link>
            </Td>
            <Td isNumeric>{nodeCount}</Td>
          </Tr>
          <Tr>
            <Td>
              <Link as={RouterLink} to="/tfgrid/twins" color="blue.500">
                Twins
              </Link>
            </Td>
            <Td isNumeric>{twinCount}</Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};

export default TFGridInfo;
