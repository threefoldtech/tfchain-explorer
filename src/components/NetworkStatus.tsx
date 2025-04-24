import React from 'react';
import { Box, Text, Flex, Badge, Select, FormControl, FormLabel } from '@chakra-ui/react';
import { useApi } from '../api/ApiContext';
import { useNetworkInfo } from '../hooks/useNetworkInfo';
import { SUBSTRATE_ENDPOINTS } from '../api/substrate';

const NetworkStatus: React.FC = () => {
  const { api, isConnected, error, endpoint, setEndpoint } = useApi();
  const { networkInfo, loading } = useNetworkInfo(api);

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndpoint(e.target.value);
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Network Status
        </Text>
        <Badge colorScheme={isConnected ? 'green' : 'red'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </Flex>

      <FormControl mb={4}>
        <FormLabel>Endpoint</FormLabel>
        <Select value={endpoint} onChange={handleEndpointChange}>
          {Object.entries(SUBSTRATE_ENDPOINTS).map(([name, url]) => (
            <option key={name} value={url}>
              {name} ({url})
            </option>
          ))}
        </Select>
      </FormControl>

      {error && (
        <Text color="red.500" mb={4}>
          Error: {error.message}
        </Text>
      )}

      {isConnected && networkInfo && !loading && (
        <Box>
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Network:</Text>
            <Text>{networkInfo.name}</Text>
          </Flex>
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Token:</Text>
            <Text>{networkInfo.tokenSymbol}</Text>
          </Flex>
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Chain Type:</Text>
            <Text>{networkInfo.chainType}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <Text fontWeight="medium">Genesis Hash:</Text>
            <Text fontSize="sm" isTruncated maxW="200px">
              {networkInfo.genesisHash}
            </Text>
          </Flex>
        </Box>
      )}

      {isConnected && loading && <Text>Loading network information...</Text>}
    </Box>
  );
};

export default NetworkStatus;
