import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Flex, 
  Heading, 
  Link, 
  Container, 
  HStack,
  Spacer
} from '@chakra-ui/react';
import Search from './Search';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" bg="gray.50" width="100%">
      <Box as="header" bg="blue.600" color="white" py={4} px={6} shadow="md" width="100%">
        <Box width="100%" px={4}>
          <Flex alignItems="center">
            <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
              <Heading size="md">Substrate Explorer</Heading>
            </Link>
            <Spacer />
            <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
              <Link as={RouterLink} to="/" fontWeight="medium">
                Home
              </Link>
              <Link as={RouterLink} to="/blocks" fontWeight="medium">
                Blocks
              </Link>
              <Link as={RouterLink} to="/tfchain" fontWeight="medium">
                TFChain
              </Link>
            </HStack>
            <Box ml={6} width={{ base: '100%', md: '300px' }}>
              <Search />
            </Box>
          </Flex>
        </Box>
      </Box>

      <Box py={6} width="100%" px={4}>
        {children}
      </Box>

      <Box as="footer" bg="gray.100" py={6} mt="auto" width="100%">
        <Box width="100%" px={4}>
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading size="sm">Substrate Explorer</Heading>
              <Box fontSize="sm" color="gray.600" mt={1}>
                A simple blockchain explorer for Substrate-based chains
              </Box>
            </Box>
            <HStack spacing={4}>
              <Link href="https://substrate.io/" isExternal fontWeight="medium">
                Substrate
              </Link>
              <Link href="https://polkadot.js.org/docs/" isExternal fontWeight="medium">
                Polkadot.js
              </Link>
            </HStack>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
