import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Spinner, 
  Text, 
  Badge,
  Input,
  InputGroup,
  Stack,
  Flex,
  Button,
  useColorModeValue,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useApi } from '../api/ApiContext';
import { TFGridFarm } from '../types';

const TFChainFarms: React.FC = () => {
  const { api } = useApi();
  const [farms, setFarms] = useState<TFGridFarm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TFGridFarm>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchFarms = async () => {
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
        
        // Get farm count from the farm ID storage value
        const farmID = await api.query.tfgridModule.farmID();
        const count = parseInt(farmID.toString());
        const farmIds = Array.from({ length: count }, (_, i) => i + 1);
        
        // Fetch all farms (limit to 100 for performance)
        const limitedFarmIds = farmIds.slice(0, 100);
        const farmPromises = limitedFarmIds.map(id => api.query.tfgridModule.farms(id));
        const farmResults = await Promise.all(farmPromises);
        
        // Process farm data
        const processedFarms = farmResults
          .map((farm, index) => {
            if (!farm || farm.isEmpty) return null;
            
            const farmData = farm.unwrap ? farm.unwrap() : farm;
            
            return {
              id: limitedFarmIds[index],
              farmId: farmData.id?.toNumber ? farmData.id.toNumber() : limitedFarmIds[index],
              name: farmData.name?.toString() || 'Unknown',
              twinId: farmData.twinId?.toNumber ? farmData.twinId.toNumber() : 0,
              pricingPolicyId: farmData.pricingPolicyId?.toNumber ? farmData.pricingPolicyId.toNumber() : 0,
              certificationType: farmData.certificationType?.toString() || 'Unknown',
              publicIps: farmData.publicIps?.toArray ? farmData.publicIps.toArray() : [],
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
    
    // Subscribe to new blocks to refresh data periodically
    const interval = setInterval(() => {
      if (api && api.isConnected) {
        fetchFarms();
      }
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [api]);

  // Filter farms based on search term
  const filteredFarms = farms.filter(farm => 
    farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    farm.id.toString().includes(searchTerm) ||
    farm.farmId.toString().includes(searchTerm) ||
    farm.twinId.toString().includes(searchTerm)
  );

  // Sort farms
  const sortedFarms = [...filteredFarms].sort((a, b) => {
    const fieldA = a[sortField];
    const fieldB = b[sortField];
    
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
  const totalPages = Math.ceil(sortedFarms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFarms = sortedFarms.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: keyof TFGridFarm) => {
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

  if (loading) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={4}>TFChain Farms</Heading>
        <Box display="flex" justifyContent="center" alignItems="center" py={10}>
          <Spinner size="xl" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={4}>TFChain Farms</Heading>
        <Text color="red.500">Error loading TFChain farms: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
      <Heading size="md" mb={4}>TFChain Farms</Heading>
      
      <Stack spacing={4} mb={4}>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <InputGroup flex="1">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search farms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            width={{ base: '100%', md: '200px' }}
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
              <Th cursor="pointer" onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('twinId')}>
                Twin ID {sortField === 'twinId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('pricingPolicyId')}>
                Pricing Policy {sortField === 'pricingPolicyId' && (sortDirection === 'asc' ? '↑' : '↓')}
              </Th>
              <Th>Certification</Th>
              <Th>Public IPs</Th>
            </Tr>
          </Thead>
          <Tbody>
            {paginatedFarms.length > 0 ? (
              paginatedFarms.map((farm) => (
                <Tr key={farm.id}>
                  <Td>{farm.id}</Td>
                  <Td>{farm.name}</Td>
                  <Td>{farm.twinId}</Td>
                  <Td>{farm.pricingPolicyId}</Td>
                  <Td>
                    <Badge colorScheme={farm.certificationType === 'Certified' ? 'green' : 'blue'}>
                      {farm.certificationType}
                    </Badge>
                  </Td>
                  <Td>{farm.publicIps?.length || 0}</Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={6} textAlign="center">No farms found</Td>
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
        Showing {paginatedFarms.length} of {filteredFarms.length} farms
      </Text>
    </Box>
  );
};

export default TFChainFarms;
