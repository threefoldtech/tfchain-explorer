import React from 'react';
import { Box, Grid, GridItem } from '@chakra-ui/react';
import NetworkStatus from '../components/NetworkStatus';
import LatestBlocks from '../components/LatestBlocks';

const HomePage: React.FC = () => {
  return (
    <Box p={4}>
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
        <GridItem colSpan={{ base: 1, md: 1 }}>
          <NetworkStatus />
        </GridItem>
        <GridItem colSpan={{ base: 1, md: 2 }}>
          <LatestBlocks />
        </GridItem>
      </Grid>
    </Box>
  );
};

export default HomePage;
