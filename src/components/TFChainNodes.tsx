import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Spinner, 
  Text, 
  Badge,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Flex,
  Button,
  Select,
  Tooltip,
  Tag,
  HStack
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useApi } from '../api/ApiContext';
import { TFGridNode } from '../types';

const formatResourceValue = (value: string): string => {
  const num = parseInt(value, 10);
  if (isNaN(num)) return value;
  
  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(2)} TB`;
  } else if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)} GB`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)} MB`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)} KB`;
  }
  return `${num}`;
};

const TFChainNodes: React.FC = () => {
  const { api } = useApi();
  const [nodes, setNodes] = useState<TFGridNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TFGridNode>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchNodes = async () => {
      if (!api || !api.isConnected) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if tfgridModule exists
        if (!api.query.tfgridModule) {
          setError(new Error('TFChain tfgridModule not found. Make sure you are connected to a TFChain node.'));
          setLoading(false);
          return;
        }
        
        // Get node count from the node ID storage value
        const nodeID = await api.query.tfgridModule.nodeID();
        const count = parseInt(nodeID.toString());
        const nodeIds = Array.from({ length: count }, (_, i) => i + 1);
        
        // Fetch nodes (limit to 100 for performance)
        const limitedNodeIds = nodeIds.slice(0, 100);
        const nodePromises = limitedNodeIds.map(id => api.query.tfgridModule.nodes(id));
        const nodeResults = await Promise.all(nodePromises);
        
        // Process node data
        const processedNodes = nodeResults
          .map((node, index) => {
            if (!node || node.isEmpty) return null;
            
            const nodeData = node.unwrap ? node.unwrap() : node;
            
            // Extract resources safely
            const resources = nodeData.resources || {};
            const location = nodeData.location || {};
            
            return {
              id: limitedNodeIds[index],
              nodeId: nodeData.id?.toNumber ? nodeData.id.toNumber() : limitedNodeIds[index],
              farmId: nodeData.farmId?.toNumber ? nodeData.farmId.toNumber() : 0,
              twinId: nodeData.twinId?.toNumber ? nodeData.twinId.toNumber() : 0,
              resources: {
                hru: resources.hru?.toString() || '0',
                sru: resources.sru?.toString() || '0',
                cru: resources.cru?.toString() || '0',
                mru: resources.mru?.toString() || '0',
              },
              location: {
                country: location.country?.toString() || 'Unknown',
                city: location.city?.toString() || 'Unknown',
                latitude: location.latitude?.toString() || '0',
                longitude: location.longitude?.toString() || '0',
              },
              status: nodeData.status?.toString() || 'Unknown',
              certificationType: nodeData.certificationType?.toString() || 'Unknown',
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
    
    // Subscribe to new blocks to refresh data periodically
    const interval = setInterval(() => {
      if (api && api.isConnected) {
        fetchNodes();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [api]);

  // Filter nodes based on search term and status
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = 
      node.id.toString().includes(searchTerm) ||
      node.nodeId.toString().includes(searchTerm) ||
      node.farmId.toString().includes(searchTerm) ||
      node.twinId.toString().includes(searchTerm) ||
      node.location.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || node.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Sort nodes
  const sortedNodes = [...filteredNodes].sort((a, b) => {
    let fieldA: any = a[sortField];
    let fieldB: any = b[sortField];
    
    // Handle nested fields
    if (sortField === 'location') {
      fieldA = a.location.country;
      fieldB = b.location.country;
    }
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    } else {
      // Handle numeric comparison
      const numA = typeof fieldA === 'number' ? fieldA : Number(fieldA);
      const numB = typeof fieldB === 'number' ? fieldB : Number(fieldB);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedNodes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNodes = sortedNodes.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof TFGridNode) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'up':
        return 'green';
      case 'down':
        return 'red';
      case 'standby':
        return 'orange';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={4}>TFChain Nodes</Heading>
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <Spinner size="xl" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={4}>TFChain Nodes</Heading>
        <Text color="red.500">Error loading TFChain nodes: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
      <Heading size="md" mb={4}>TFChain Nodes</Heading>
      
      <Stack spacing={4} mb={4}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            width={{ base: '100%', md: '150px' }}
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="up">Up</option>
            <option value="down">Down</option>
            <option value="standby">Standby</option>
          </Select>
          
          <Select 
            width={{ base: '100%', md: '150px' }}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </Select>
        </Flex>
      </Stack>
      
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th cursor="pointer" onClick={() => handleSort('id')}>
                ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('farmId')}>
                Farm ID {sortField === 'farmId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('twinId')}>
                Twin ID {sortField === 'twinId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th>Location</Th>
              <Th>Resources</Th>
              <Th>Status</Th>
              <Th>Certification</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedNodes.length > 0 ? (
              paginatedNodes.map((node) => (
                <Tr key={node.id}>
                  <Td>{node.id}</Td>
                  <Td>{node.farmId}</Td>
                  <Td>{node.twinId}</Td>
                  <Td>
                    <Tooltip label={`${node.location.city}, ${node.location.country} (${node.location.latitude}, ${node.location.longitude})`}>
                      <Text>{node.location.country}, {node.location.city}</Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tag size="sm" colorScheme="blue" title="CPU">CRU: {node.resources.cru}</Tag>
                      <Tag size="sm" colorScheme="green" title="Memory">MRU: {formatResourceValue(node.resources.mru)}</Tag>
                      <Tag size="sm" colorScheme="purple" title="SSD">SRU: {formatResourceValue(node.resources.sru)}</Tag>
                      <Tag size="sm" colorScheme="orange" title="HDD">HRU: {formatResourceValue(node.resources.hru)}</Tag>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(node.status)}>
                      {node.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={node.certificationType === 'Certified' ? 'green' : 'blue'}>
                      {node.certificationType}
                    </Badge>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={7} textAlign="center">No nodes found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justifyContent="center" mt={4} gap={2}>
          <Button 
            size="sm" 
            onClick={() => handlePageChange(1)} 
            disabled={currentPage === 1}
          >
            First
          </Button>
          <Button 
            size="sm" 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Show pages around current page
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNum}
                size="sm"
                colorScheme={currentPage === pageNum ? "blue" : "gray"}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          
          <Button 
            size="sm" 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
          <Button 
            size="sm" 
            onClick={() => handlePageChange(totalPages)} 
            disabled={currentPage === totalPages}
          >
            Last
          </Button>
        </Flex>
      )}
      
      <Text fontSize="sm" textAlign="center" mt={2}>
        Showing {paginatedNodes.length} of {filteredNodes.length} nodes (out of {nodes.length} total)
      </Text>
    </Box>
  );
};

export default TFChainNodes;
