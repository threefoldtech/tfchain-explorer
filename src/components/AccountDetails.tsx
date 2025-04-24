import React from 'react';
import { Box, Text, Spinner, Flex, Divider } from '@chakra-ui/react';
import { useApi } from '../api/ApiContext';
import { useAccount } from '../hooks/useAccounts';
import { formatCurrency } from '../utils/format';
import { useNetworkInfo } from '../hooks/useNetworkInfo';

interface AccountDetailsProps {
  address: string;
}

const AccountDetails: React.FC<AccountDetailsProps> = ({ address }) => {
  const { api } = useApi();
  const { account, loading, error } = useAccount(api, address);
  const { networkInfo } = useNetworkInfo(api);

  // Set up the token decimals and symbol for formatting
  const tokenDecimals = networkInfo?.tokenDecimals || 12;
  const tokenSymbol = networkInfo?.tokenSymbol || 'UNIT';

  if (loading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Account Details
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
          Account Details
        </Text>
        <Text color="red.500">Error: {error.message}</Text>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Account Details
        </Text>
        <Text>Account not found or no data available</Text>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Account Details
      </Text>

      <Box mb={6}>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Address:</Text>
          <Text fontFamily="monospace" fontSize="sm">{account.address}</Text>
        </Flex>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Nonce:</Text>
          <Text>{account.nonce}</Text>
        </Flex>
      </Box>

      <Divider mb={6} />

      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Balances
      </Text>

      <Box>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Total Balance:</Text>
          <Text>{formatCurrency(account.balance, tokenDecimals, tokenSymbol)}</Text>
        </Flex>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Free Balance:</Text>
          <Text>{formatCurrency(account.freeBalance || '0', tokenDecimals, tokenSymbol)}</Text>
        </Flex>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Reserved Balance:</Text>
          <Text>{formatCurrency(account.reservedBalance || '0', tokenDecimals, tokenSymbol)}</Text>
        </Flex>
        <Flex justifyContent="space-between" mb={2}>
          <Text fontWeight="medium">Locked Balance:</Text>
          <Text>{formatCurrency(account.lockedBalance || '0', tokenDecimals, tokenSymbol)}</Text>
        </Flex>
      </Box>
    </Box>
  );
};

export default AccountDetails;
