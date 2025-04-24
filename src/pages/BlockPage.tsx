import React from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import BlockDetails from '../components/BlockDetails';

const BlockPage: React.FC = () => {
  const { blockId } = useParams<{ blockId: string }>();

  if (!blockId) {
    return <Box p={4}>Block ID is required</Box>;
  }

  return (
    <Box p={4}>
      <BlockDetails blockHashOrNumber={blockId} />
    </Box>
  );
};

export default BlockPage;
