import React, { useState } from 'react';
import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner, Link, Select, Flex, Badge } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../api/ApiContext';
import { useLatestBlocks } from '../hooks/useBlocks';
import { formatBlockNumber, shortenHash, formatDate } from '../utils/format';

const LatestBlocks: React.FC = () => {
  const { api } = useApi();
  const [blockCount, setBlockCount] = useState(20);
  const { blocks, loading, error } = useLatestBlocks(api, blockCount);

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Latest Blocks
        </Text>
        <Box textAlign="center" py={4}>
          <Spinner size="xl" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Latest Blocks
        </Text>
        <Text color="red.500">Error: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          Latest Blocks
        </Text>
        <Select 
          value={blockCount} 
          onChange={(e) => setBlockCount(Number(e.target.value))} 
          width="120px"
          size="sm"
        >
          <option value="10">10 Blocks</option>
          <option value="20">20 Blocks</option>
          <option value="30">30 Blocks</option>
          <option value="50">50 Blocks</option>
        </Select>
      </Flex>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Block</Th>
              <Th>Hash</Th>
              <Th>Time</Th>
              <Th>Extrinsics</Th>
              <Th>Events</Th>
              <Th>TFChain Ops</Th>
            </Tr>
          </Thead>
          <Tbody>
            {blocks.map((block) => {
              // Count TFChain operations
              const tfchainOps = block.extrinsics.filter(ex => 
                ex.section === 'tfgridModule' || 
                ex.section === 'smartContractModule' || 
                ex.section === 'tftBridgeModule'
              );
              
              // Count events
              const eventCount = block.events?.length || 0;
              
              return (
                <Tr key={block.hash}>
                  <Td>
                    <Link as={RouterLink} to={`/block/${block.number}`} color="blue.500">
                      {formatBlockNumber(block.number)}
                    </Link>
                  </Td>
                  <Td>
                    <Link as={RouterLink} to={`/block/${block.hash}`} color="blue.500">
                      {shortenHash(block.hash)}
                    </Link>
                  </Td>
                  <Td>
                    {block.timestamp ? formatDate(parseInt(block.timestamp)) : 'N/A'}
                  </Td>
                  <Td>
                    <Link as={RouterLink} to={`/block/${block.number}`} color="blue.500">
                      {block.extrinsics.length}
                    </Link>
                  </Td>
                  <Td>
                    {eventCount > 0 ? (
                      <Link as={RouterLink} to={`/block/${block.number}`} color="blue.500">
                        {eventCount}
                      </Link>
                    ) : '0'}
                  </Td>
                  <Td>
                    {tfchainOps.length > 0 ? (
                      <Badge colorScheme="green" variant="subtle" borderRadius="full" px={2}>
                        {tfchainOps.length}
                      </Badge>
                    ) : '0'}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default LatestBlocks;
