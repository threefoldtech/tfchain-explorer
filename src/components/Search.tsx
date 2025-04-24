import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Input, 
  InputGroup, 
  InputRightElement, 
  IconButton, 
  useToast 
} from '@chakra-ui/react';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      return;
    }
    
    // Determine what type of data the user is searching for
    if (/^\d+$/.test(query)) {
      // It's a block number
      navigate(`/block/${query}`);
    } else if (query.startsWith('0x') && query.length >= 10) {
      // It's likely a hash (block or transaction)
      if (query.length === 66) {
        // Typical length for a block or transaction hash
        navigate(`/block/${query}`);
      } else {
        toast({
          title: 'Invalid hash format',
          description: 'The hash you entered does not match the expected format.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } else if (query.length > 40) {
      // It's likely an account address
      navigate(`/account/${query}`);
    } else {
      toast({
        title: 'Invalid search query',
        description: 'Please enter a valid block number, hash, or account address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    
    setQuery('');
  };

  return (
    <Box as="form" onSubmit={handleSearch} width="100%">
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          placeholder="Search by block, hash, or account"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <InputRightElement width="4.5rem">
          <IconButton
            h="1.75rem"
            size="sm"
            aria-label="Search"
            type="submit"
            icon={<span>🔍</span>}
          />
        </InputRightElement>
      </InputGroup>
    </Box>
  );
};

export default Search;
