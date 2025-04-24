import React from 'react';
import { 
  Box, 
  Text, 
  Spinner, 
  Flex, 
  Divider, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Link,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useApi } from '../api/ApiContext';
import { useBlock } from '../hooks/useBlocks';
import { formatDate, shortenHash } from '../utils/format';

interface BlockDetailsProps {
  blockHashOrNumber: string;
}

const BlockDetails: React.FC<BlockDetailsProps> = ({ blockHashOrNumber }) => {
  const { api } = useApi();
  const { block, loading, error } = useBlock(api, blockHashOrNumber);

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Block Details
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
          Block Details
        </Text>
        <Text color="red.500">Error: {error.message}</Text>
      </Box>
    );
  }

  if (!block) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Block Details
        </Text>
        <Text>Block not found</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Block #{block.number}
      </Text>

      <Box mb={6}>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Block Hash:</Text>
          <Text fontFamily="monospace">{block.hash}</Text>
        </Flex>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Parent Hash:</Text>
          <Link as={RouterLink} to={`/block/${block.parentHash}`} color="blue.500" fontFamily="monospace">
            {block.parentHash}
          </Link>
        </Flex>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">State Root:</Text>
          <Text fontFamily="monospace">{block.stateRoot}</Text>
        </Flex>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Extrinsics Root:</Text>
          <Text fontFamily="monospace">{block.extrinsicsRoot}</Text>
        </Flex>
        {block.author && (
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Author:</Text>
            <Link as={RouterLink} to={`/account/${block.author}`} color="blue.500" fontFamily="monospace">
              {block.author}
            </Link>
          </Flex>
        )}
        {block.timestamp && (
          <Flex justifyContent="space-between" mb={2}>
            <Text fontWeight="medium">Timestamp:</Text>
            <Text>{formatDate(parseInt(block.timestamp))}</Text>
          </Flex>
        )}
      </Box>

      <Divider mb={6} />

      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Extrinsics ({block.extrinsics.length})
      </Text>

      <Accordion allowMultiple>
        {block.extrinsics.map((extrinsic, index) => (
          <AccordionItem key={extrinsic.hash}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Flex alignItems="center">
                    <Text mr={2}>#{index}</Text>
                    <Text fontWeight="medium" mr={2}>
                      {extrinsic.section}.{extrinsic.method}
                    </Text>
                    {extrinsic.success !== undefined && (
                      <Badge colorScheme={extrinsic.success ? 'green' : 'red'}>
                        {extrinsic.success ? 'Success' : 'Failed'}
                      </Badge>
                    )}
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box mb={4}>
                <Flex justifyContent="space-between" mb={2}>
                  <Text fontWeight="medium">Hash:</Text>
                  <Text fontFamily="monospace">{extrinsic.hash}</Text>
                </Flex>
                {extrinsic.signer && (
                  <Flex justifyContent="space-between" mb={2}>
                    <Text fontWeight="medium">Signer:</Text>
                    <Link as={RouterLink} to={`/account/${extrinsic.signer}`} color="blue.500" fontFamily="monospace">
                      {extrinsic.signer}
                    </Link>
                  </Flex>
                )}
                {extrinsic.nonce && (
                  <Flex justifyContent="space-between" mb={2}>
                    <Text fontWeight="medium">Nonce:</Text>
                    <Text>{extrinsic.nonce}</Text>
                  </Flex>
                )}
              </Box>

              <Text fontWeight="medium" mb={2}>Arguments:</Text>
              <Box 
                p={3} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="gray.50" 
                fontFamily="monospace"
                fontSize="sm"
                overflowX="auto"
              >
                <pre>{JSON.stringify(extrinsic.args, null, 2)}</pre>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      <Divider my={6} />

      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Events ({block.events ? block.events.length : 0})
      </Text>

      <Accordion allowMultiple>
        {block.events && block.events.map((event, index) => (
          <AccordionItem key={`${event.section}-${event.method}-${index}`}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Flex alignItems="center">
                    <Text mr={2}>#{index}</Text>
                    <Text fontWeight="medium" mr={2}>
                      {event.section}.{event.method}
                    </Text>
                    <Badge colorScheme="blue" ml={2}>
                      {event.phase}
                    </Badge>
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text fontWeight="medium" mb={2}>Data:</Text>
              <Box 
                p={3} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="gray.50" 
                fontFamily="monospace"
                fontSize="sm"
                overflowX="auto"
              >
                <pre>{JSON.stringify(event.data, null, 2)}</pre>
              </Box>
              
              {event.topics && event.topics.length > 0 && (
                <>
                  <Text fontWeight="medium" mt={4} mb={2}>Topics:</Text>
                  <Box 
                    p={3} 
                    borderWidth="1px" 
                    borderRadius="md" 
                    bg="gray.50" 
                    fontFamily="monospace"
                    fontSize="sm"
                    overflowX="auto"
                  >
                    {event.topics.map((topic, i) => (
                      <Text key={i}>{topic}</Text>
                    ))}
                  </Box>
                </>
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default BlockDetails;
