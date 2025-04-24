import React, { useState } from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { useApi } from '../api/ApiContext';
import TFChainStats from '../components/TFChainStats';
import TFChainFarms from '../components/TFChainFarms';
import TFChainNodes from '../components/TFChainNodes';
import TFChainPallets from '../components/TFChainPallets';

const TFChainPage: React.FC = () => {
  const { api, isConnected, endpoint } = useApi();
  const [tabIndex, setTabIndex] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
  };

  // Extract network name from endpoint
  const getNetworkName = () => {
    if (endpoint.includes('dev.grid.tf')) return 'Development';
    if (endpoint.includes('qa.grid.tf')) return 'QA';
    if (endpoint.includes('test.grid.tf')) return 'Test';
    if (endpoint.includes('grid.tf') && !endpoint.includes('dev') && !endpoint.includes('qa') && !endpoint.includes('test')) return 'Production';
    if (endpoint.includes('127.0.0.1') || endpoint.includes('localhost')) return 'Local';
    return 'Unknown';
  };

  return (
    <Box p={4}>
      <Box mb={6} p={5} shadow="md" borderWidth="1px" borderRadius="lg" bg={bgColor}>
        <Heading size="md" mb={2}>TFChain Explorer</Heading>
        <Text>
          Network: <strong>{getNetworkName()}</strong> ({endpoint})
        </Text>
        <Text>
          Connection Status: {isConnected ? 
            <Text as="span" color="green.500">Connected</Text> : 
            <Text as="span" color="red.500">Disconnected</Text>
          }
        </Text>
      </Box>

      <Tabs variant="enclosed" colorScheme="blue" isLazy onChange={handleTabsChange} index={tabIndex}>
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Farms</Tab>
          <Tab>Nodes</Tab>
          <Tab>Pallets & Types</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TFChainStats />
          </TabPanel>
          <TabPanel>
            <TFChainFarms />
          </TabPanel>
          <TabPanel>
            <TFChainNodes />
          </TabPanel>
          <TabPanel>
            <TFChainPallets />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default TFChainPage;
