import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Text,
  Link,
  Badge,
  Input,
  Button,
  Flex,
  Alert,
  AlertIcon,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Tooltip,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider
} from '@chakra-ui/react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useApi } from '../api/ApiContext';
import { formatBlockNumber, shortenHash, formatDate } from '../utils/format';

interface Transaction {
  blockNumber: string;
  blockHash: string;
  extrinsicIndex: number;
  extrinsicHash: string;
  method: string;
  section: string;
  timestamp: string;
  success: boolean;
  args: Record<string, any>;
}

const AccountTransactions: React.FC = () => {
  const { api } = useApi();
  const { address: urlAddress } = useParams<{ address: string }>();
  const [address, setAddress] = useState<string>(urlAddress || '');
  const [searchAddress, setSearchAddress] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [blockSubscription, setBlockSubscription] = useState<any>(null);
  const [processingProgress, setProcessingProgress] = useState<{ processed: number; total: number } | null>(null);
  
  // Block range state
  const [latestBlockNumber, setLatestBlockNumber] = useState<number>(0);
  const [startBlock, setStartBlock] = useState<number>(0);
  const [endBlock, setEndBlock] = useState<number>(0);
  const [blockRange, setBlockRange] = useState<number>(100);
  const [customBlockRange, setCustomBlockRange] = useState<boolean>(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const buttonColorScheme = useColorModeValue('blue', 'teal');

  // Fetch the latest block number when the API is connected
  useEffect(() => {
    if (!api || !api.isConnected) return;

    const fetchLatestBlock = async () => {
      try {
        const lastHeader = await api.rpc.chain.getHeader();
        const latestNumber = lastHeader.number.unwrap().toNumber();
        setLatestBlockNumber(latestNumber);
        setEndBlock(latestNumber);
        setStartBlock(Math.max(0, latestNumber - blockRange));
      } catch (err) {
        console.error('Error fetching latest block:', err);
      }
    };

    fetchLatestBlock();

    // Subscribe to new headers to keep the latest block number updated
    let unsub: any;
    api.rpc.chain.subscribeNewHeads((header) => {
      const newBlockNumber = header.number.unwrap().toNumber();
      setLatestBlockNumber(newBlockNumber);
      // Only update end block if it was previously set to the latest block
      if (endBlock === latestBlockNumber) {
        setEndBlock(newBlockNumber);
      }
    }).then(u => { unsub = u; }).catch(console.error);

    return () => {
      if (unsub) unsub();
    };
  }, [api]);

  // Update block range when blockRange changes
  useEffect(() => {
    if (latestBlockNumber > 0 && !customBlockRange) {
      setEndBlock(latestBlockNumber);
      setStartBlock(Math.max(0, latestBlockNumber - blockRange));
    }
  }, [blockRange, latestBlockNumber, customBlockRange]);

  // Automatically fetch transactions when address is available from URL
  useEffect(() => {
    if (urlAddress && api && api.isConnected) {
      setAddress(urlAddress);
      setSearchAddress(urlAddress);
      fetchAccountTransactions(urlAddress);
    }
  }, [urlAddress, api]);

  // Clean up subscription on unmount
  useEffect(() => {
    return () => {
      if (blockSubscription) {
        blockSubscription();
      }
    };
  }, [blockSubscription]);

  const fetchAccountTransactions = async (accountAddress: string) => {
    if (!api || !api.isConnected) {
      setError('API is not connected');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTransactions([]);

      // Validate the address format
      try {
        // This will throw if the address is invalid
        api.createType('AccountId', accountAddress);
      } catch (e) {
        setError('Invalid account address format');
        setLoading(false);
        return;
      }

      // Make sure we have valid block range
      if (startBlock > endBlock) {
        setError('Start block must be less than or equal to end block');
        setLoading(false);
        return;
      }

      if (endBlock <= 0 || startBlock < 0) {
        setError('Block numbers must be positive');
        setLoading(false);
        return;
      }

      // Check if the range is too large
      const blockRangeSize = endBlock - startBlock + 1;
      if (blockRangeSize > 10000) {
        setError('Block range too large. Please limit to 10,000 blocks maximum.');
        setLoading(false);
        return;
      }
      
      const txs: Transaction[] = [];
      
      // Fetch blocks and check for transactions involving the address
      // Process blocks in descending order (newest to oldest)
      setProcessingProgress({ processed: 0, total: blockRangeSize });
      
      for (let i = endBlock; i >= startBlock; i--) {
        // Update progress for UI display
        const processed = endBlock - i + 1;
        setProcessingProgress({ processed, total: blockRangeSize });
        
        // Show progress in the console for debugging
        if (i % 10 === 0) {
          console.log(`Processing block ${i} (${Math.round(processed / blockRangeSize * 100)}% complete)`);
        }
        
        try {
          const blockHash = await api.rpc.chain.getBlockHash(i);
          const apiAt = await api.at(blockHash);
          const block = await api.rpc.chain.getBlock(blockHash);
          const timestamp = await apiAt.query.timestamp.now();
          const allEvents = await apiAt.query.system.events();
          
          // Check each extrinsic in the block
          block.block.extrinsics.forEach((extrinsic, index) => {
            const extrinsicAddress = extrinsic.signer.toString();
            
            // Check if this extrinsic involves our address
            if (extrinsicAddress === accountAddress) {
              // Get events related to this extrinsic
              // Cast allEvents to any to handle the filter method
              const extrinsicEvents = (allEvents as any[]).filter(
                ({ phase }: any) => 
                  phase.isApplyExtrinsic && 
                  phase.asApplyExtrinsic.eq(index)
              );
              
              // Check if extrinsic was successful
              const success = extrinsicEvents.some(
                (event: any) => api.events.system.ExtrinsicSuccess.is(event.event)
              );
              
              const { method, section, args } = extrinsic.method.toHuman() as any;
              
              txs.push({
                blockNumber: i.toString(),
                blockHash: blockHash.toString(),
                extrinsicIndex: index,
                extrinsicHash: extrinsic.hash.toHex(),
                method,
                section,
                timestamp: timestamp.toString(),
                success,
                args
              });
            }
          });
        } catch (err) {
          console.error(`Error processing block ${i}:`, err);
          // Continue with next block even if this one fails
        }
      }
      
      setTransactions(txs);
      
      // Subscribe to new blocks to update transactions in real-time
      if (blockSubscription) {
        blockSubscription();
      }
      
      const unsub = await api.rpc.chain.subscribeNewHeads(async (header) => {
        const blockNumber = header.number.unwrap().toNumber();
        
        // Only process new blocks if they're in our range
        if (blockNumber > endBlock) {
          try {
            const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
            const apiAt = await api.at(blockHash);
            const block = await api.rpc.chain.getBlock(blockHash);
            const timestamp = await apiAt.query.timestamp.now();
            const allEvents = await apiAt.query.system.events();
            
            const newTxs: Transaction[] = [];
            
            // Check each extrinsic in the new block
            block.block.extrinsics.forEach((extrinsic, index) => {
              const extrinsicAddress = extrinsic.signer.toString();
              
              if (extrinsicAddress === accountAddress) {
                // Get events related to this extrinsic
                // Cast allEvents to any to handle the filter method
                const extrinsicEvents = (allEvents as any[]).filter(
                  ({ phase }: any) => 
                    phase.isApplyExtrinsic && 
                    phase.asApplyExtrinsic.eq(index)
                );
                
                // Check if extrinsic was successful
                const success = extrinsicEvents.some(
                  (event: any) => api.events.system.ExtrinsicSuccess.is(event.event)
                );
                
                const { method, section, args } = extrinsic.method.toHuman() as any;
                
                newTxs.push({
                  blockNumber: blockNumber.toString(),
                  blockHash: blockHash.toString(),
                  extrinsicIndex: index,
                  extrinsicHash: extrinsic.hash.toHex(),
                  method,
                  section,
                  timestamp: timestamp.toString(),
                  success,
                  args
                });
              }
            });
            
            if (newTxs.length > 0) {
              setTransactions(prev => [...newTxs, ...prev]);
            }
          } catch (err) {
            console.error(`Error processing new block ${blockNumber}:`, err);
          }
        }
      });
      
      setBlockSubscription(() => unsub);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch account transactions');
    } finally {
      setLoading(false);
      setProcessingProgress(null);
    }
  };

  const handleSearch = () => {
    if (searchAddress.trim()) {
      setAddress(searchAddress.trim());
      fetchAccountTransactions(searchAddress.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Set block range shortcuts
  const setBlockRangeShortcut = (range: number) => {
    setBlockRange(range);
    setCustomBlockRange(false);
    // Don't fetch transactions here, just update the range
  };

  // Apply the current block range and fetch transactions
  const setCustomRange = () => {
    setCustomBlockRange(true);
    fetchAccountTransactions(address);
  };

  // Set start block to the first block
  const setStartToFirstBlock = () => {
    setStartBlock(0);
    setCustomBlockRange(true);
  };

  // Set end block to the latest block
  const setEndToLatestBlock = () => {
    setEndBlock(latestBlockNumber);
    setCustomBlockRange(true);
  };

  // Format transaction arguments for display
  const formatArgs = (args: Record<string, any>): string => {
    if (!args || Object.keys(args).length === 0) {
      return 'No arguments';
    }
    
    try {
      return Object.entries(args)
        .map(([key, value]) => {
          if (typeof value === 'object') {
            return `${key}: ${JSON.stringify(value).substring(0, 30)}${JSON.stringify(value).length > 30 ? '...' : ''}`;
          }
          return `${key}: ${value}`;
        })
        .join(', ');
    } catch (e) {
      return 'Complex arguments';
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} mb={5} width="100%">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Account Transactions
      </Text>
      
      <Flex mb={5} direction={{ base: "column", md: "row" }}>
        <InputGroup size="md" mr={{ base: 0, md: 4 }} mb={{ base: 4, md: 0 }}>
          <Input
            placeholder="Enter account address"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            pr="4.5rem"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleSearch} isLoading={loading}>
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
      </Flex>
      
      {/* Block Range Controls */}
      <Box mb={5} p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
        <Text fontSize="md" fontWeight="bold" mb={3}>Block Range Selection</Text>
        
        <HStack spacing={4} mb={4} wrap="wrap">
          <Stat size="sm">
            <StatLabel>Latest Block</StatLabel>
            <StatNumber>{latestBlockNumber.toLocaleString()}</StatNumber>
          </Stat>
          
          <Stat size="sm">
            <StatLabel>Current Range</StatLabel>
            <StatNumber>{startBlock.toLocaleString()} - {endBlock.toLocaleString()}</StatNumber>
            <StatHelpText>{(endBlock - startBlock + 1).toLocaleString()} blocks</StatHelpText>
          </Stat>
        </HStack>
        
        <Text fontSize="sm" mb={2}>Quick Ranges:</Text>
        <HStack spacing={2} mb={4} wrap="wrap">
          <Button size="sm" onClick={() => setBlockRangeShortcut(100)} colorScheme={blockRange === 100 && !customBlockRange ? buttonColorScheme : undefined} variant={blockRange === 100 && !customBlockRange ? "solid" : "outline"}>
            Last 100
          </Button>
          <Button size="sm" onClick={() => setBlockRangeShortcut(500)} colorScheme={blockRange === 500 && !customBlockRange ? buttonColorScheme : undefined} variant={blockRange === 500 && !customBlockRange ? "solid" : "outline"}>
            Last 500
          </Button>
          <Button size="sm" onClick={() => setBlockRangeShortcut(1000)} colorScheme={blockRange === 1000 && !customBlockRange ? buttonColorScheme : undefined} variant={blockRange === 1000 && !customBlockRange ? "solid" : "outline"}>
            Last 1,000
          </Button>
          <Button size="sm" onClick={() => setBlockRangeShortcut(5000)} colorScheme={blockRange === 5000 && !customBlockRange ? buttonColorScheme : undefined} variant={blockRange === 5000 && !customBlockRange ? "solid" : "outline"}>
            Last 5,000
          </Button>
        </HStack>
        
        <Text fontSize="sm" mb={2}>Custom Range:</Text>
        <HStack spacing={2} mb={2} align="flex-end">
          <Box>
            <Text fontSize="xs" mb={1}>Start Block</Text>
            <NumberInput 
              size="sm" 
              min={0} 
              max={endBlock} 
              value={startBlock}
              onChange={(_, val) => setStartBlock(val)}
              maxW="150px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
          
          <Box>
            <Text fontSize="xs" mb={1}>End Block</Text>
            <NumberInput 
              size="sm" 
              min={startBlock} 
              max={latestBlockNumber} 
              value={endBlock}
              onChange={(_, val) => setEndBlock(val)}
              maxW="150px"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
          
          <Button size="sm" onClick={setStartToFirstBlock}>
            First Block
          </Button>
          
          <Button size="sm" onClick={setEndToLatestBlock}>
            Latest Block
          </Button>
          
          <Button 
            size="sm" 
            colorScheme={buttonColorScheme}
            onClick={setCustomRange}
            isDisabled={!address}
          >
            Apply Range
          </Button>
        </HStack>
      </Box>
      
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Searching for transactions in blocks {startBlock.toLocaleString()} to {endBlock.toLocaleString()}...</Text>
          {processingProgress && (
            <Text mt={2} fontSize="sm">
              Processed {processingProgress.processed.toLocaleString()} of {processingProgress.total.toLocaleString()} blocks 
              ({Math.round((processingProgress.processed / processingProgress.total) * 100)}%)
            </Text>
          )}
        </Box>
      ) : transactions.length > 0 ? (
        <Box overflowX="auto" width="100%">
          <Table variant="simple" size="sm" width="100%">
            <Thead>
              <Tr>
                <Th>Block</Th>
                <Th>Time</Th>
                <Th>Extrinsic</Th>
                <Th>Call</Th>
                <Th>Status</Th>
                <Th>Arguments</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map((tx) => (
                <Tr key={`${tx.blockNumber}-${tx.extrinsicIndex}`}>
                  <Td>
                    <Link as={RouterLink} to={`/block/${tx.blockNumber}`} color="blue.500">
                      {formatBlockNumber(tx.blockNumber)}
                    </Link>
                  </Td>
                  <Td>
                    {tx.timestamp ? formatDate(parseInt(tx.timestamp)) : 'N/A'}
                  </Td>
                  <Td>
                    <Tooltip label={tx.extrinsicHash}>
                      <span>{shortenHash(tx.extrinsicHash)}</span>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Badge colorScheme={tx.section === 'tfgridModule' || tx.section === 'smartContractModule' ? 'green' : 'blue'}>
                      {tx.section}.{tx.method}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={tx.success ? 'green' : 'red'}>
                      {tx.success ? 'Success' : 'Failed'}
                    </Badge>
                  </Td>
                  <Td>
                    <Tooltip label={formatArgs(tx.args)}>
                      <Text isTruncated maxWidth="200px">
                        {formatArgs(tx.args)}
                      </Text>
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : address ? (
        <Box textAlign="center" py={10}>
          <Text>No transactions found for this account in blocks {startBlock.toLocaleString()} to {endBlock.toLocaleString()}</Text>
        </Box>
      ) : (
        <Box textAlign="center" py={10}>
          <Text>Enter an account address to view transaction history</Text>
        </Box>
      )}
    </Box>
  );
};

export default AccountTransactions;
