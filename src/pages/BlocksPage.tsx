import React from 'react';
import { Box } from '@chakra-ui/react';
import LatestBlocks from '../components/LatestBlocks';

const BlocksPage: React.FC = () => {
  return (
    <Box p={4}>
      <LatestBlocks />
    </Box>
  );
};

export default BlocksPage;
