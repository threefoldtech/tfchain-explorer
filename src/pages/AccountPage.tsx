import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import AccountDetails from '../components/AccountDetails';
import AccountTransactions from '../components/AccountTransactions';

const AccountPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();

  if (!address) {
    return <Box p={4}>Account address is required</Box>;
  }

  return (
    <Box p={4} width="100%">
      <Tabs variant="enclosed" colorScheme="blue" isLazy width="100%">
        <TabList mb="1em">
          <Tab>Account Details</Tab>
          <Tab>Transaction History</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0} pt={4}>
            <AccountDetails address={address} />
          </TabPanel>
          <TabPanel p={0} pt={4}>
            <AccountTransactions />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AccountPage;
