import React from 'react';
import {
  Box,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Badge,
  Flex,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';

const TFChainPallets: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // TFChain pallets information
  const pallets = [
    {
      name: 'TFGrid Module',
      id: 'tfgridModule',
      description: 'Core pallet for managing the ThreeFold Grid resources including farms, nodes, and twins.',
      methods: [
        { name: 'createFarm', description: 'Create a new farm in the TF Grid' },
        { name: 'updateFarm', description: 'Update an existing farm\'s information' },
        { name: 'createNode', description: 'Register a new node in the TF Grid' },
        { name: 'updateNode', description: 'Update an existing node\'s information' },
        { name: 'createTwin', description: 'Create a new digital twin' },
        { name: 'updateTwin', description: 'Update an existing twin\'s information' },
        { name: 'deleteNode', description: 'Remove a node from the grid' },
        { name: 'reportUptime', description: 'Report node uptime statistics' },
        { name: 'addNodePublicConfig', description: 'Add public configuration to a node' },
        { name: 'setNodeCertification', description: 'Set certification level for a node' }
      ],
      types: [
        { name: 'Farm', description: 'Represents a farm in the TF Grid with ID, name, and certification' },
        { name: 'Node', description: 'Represents a compute node with resources, location, and status' },
        { name: 'Twin', description: 'Digital identity that can own resources and contracts' },
        { name: 'NodeCertification', description: 'Certification level of a node (DIY, Certified)' },
        { name: 'FarmCertification', description: 'Certification level of a farm (NotCertified, Gold, Silver)' },
        { name: 'Resources', description: 'Compute resources available on a node (CPU, memory, SSD)' },
        { name: 'Location', description: 'Geographic location of a node or farm' }
      ]
    },
    {
      name: 'Smart Contract Module',
      id: 'smartContractModule',
      description: 'Manages deployment contracts for workloads on the ThreeFold Grid.',
      methods: [
        { name: 'createContract', description: 'Create a new deployment contract' },
        { name: 'updateContract', description: 'Update an existing contract' },
        { name: 'cancelContract', description: 'Cancel an active contract' },
        { name: 'createNameContract', description: 'Register a name on the TF Grid' },
        { name: 'addNruReports', description: 'Add Network Resource Units usage reports' },
        { name: 'reportContractResources', description: 'Report resource usage for billing' },
        { name: 'createRentContract', description: 'Create a node rental contract' },
        { name: 'cancelRentContract', description: 'Cancel a node rental contract' }
      ],
      types: [
        { name: 'Contract', description: 'Deployment contract for workloads on the grid' },
        { name: 'ContractState', description: 'State of a contract (Created, Deleted)' },
        { name: 'ContractBillingInformation', description: 'Billing details for a contract' },
        { name: 'NodeContract', description: 'Contract specific to a node deployment' },
        { name: 'NameContract', description: 'Contract for name registration' },
        { name: 'RentContract', description: 'Contract for renting an entire node' }
      ]
    },
    {
      name: 'TFT Bridge Module',
      id: 'tftBridgeModule',
      description: 'Handles TFT token transfers between different blockchains.',
      methods: [
        { name: 'proposeMint', description: 'Propose a mint transaction from another chain' },
        { name: 'proposeBurn', description: 'Propose a burn transaction to another chain' },
        { name: 'mintCompleted', description: 'Mark a mint operation as completed' },
        { name: 'burnCompleted', description: 'Mark a burn operation as completed' },
        { name: 'addBurnTransaction', description: 'Add a new burn transaction' },
        { name: 'addMintTransaction', description: 'Add a new mint transaction' }
      ],
      types: [
        { name: 'MintTransaction', description: 'Transaction to mint TFT from another chain' },
        { name: 'BurnTransaction', description: 'Transaction to burn TFT to another chain' },
        { name: 'RefundTransaction', description: 'Transaction to refund failed operations' },
        { name: 'BridgeEvent', description: 'Events related to bridge operations' }
      ]
    },
    {
      name: 'KVStore Module',
      id: 'kvStore',
      description: 'Simple key-value store for TFChain applications.',
      methods: [
        { name: 'set', description: 'Set a key-value pair' },
        { name: 'delete', description: 'Delete a key-value pair' }
      ],
      types: [
        { name: 'Key', description: 'Key in the key-value store' },
        { name: 'Value', description: 'Value in the key-value store' }
      ]
    }
  ];

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor} mb={5}>
      <Heading size="lg" mb={4}>TFChain Pallets & Types</Heading>
      <Text mb={5}>
        TFChain extends Substrate with custom pallets to manage the ThreeFold Grid infrastructure. 
        This explorer provides detailed information about these pallets and their associated types.
      </Text>

      <Accordion allowMultiple defaultIndex={[0]}>
        {pallets.map((pallet) => (
          <AccordionItem key={pallet.id} borderColor={borderColor}>
            <h2>
              <AccordionButton py={3}>
                <Box flex="1" textAlign="left">
                  <Flex alignItems="center">
                    <Heading size="md">{pallet.name}</Heading>
                    <Badge ml={2} colorScheme="blue" variant="subtle">
                      {pallet.id}
                    </Badge>
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Text mb={4}>{pallet.description}</Text>
              
              <Heading size="sm" mb={2}>Methods</Heading>
              <Table variant="simple" size="sm" mb={4}>
                <Thead>
                  <Tr>
                    <Th>Method</Th>
                    <Th>Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pallet.methods.map((method, idx) => (
                    <Tr key={idx}>
                      <Td><Code>{method.name}</Code></Td>
                      <Td>{method.description}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              <Divider my={4} />
              
              <Heading size="sm" mb={2}>Types</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Type</Th>
                    <Th>Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pallet.types.map((type, idx) => (
                    <Tr key={idx}>
                      <Td><Code>{type.name}</Code></Td>
                      <Td>{type.description}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
};

export default TFChainPallets;
