// React is implicitly imported with JSX
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { ApiProvider } from './api/ApiContext';
import { initFormatBalance } from './utils/format';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import BlockPage from './pages/BlockPage';
import BlocksPage from './pages/BlocksPage';
import AccountPage from './pages/AccountPage';
import TFChainPage from './pages/TFChainPage';

// Initialize the balance formatter
initFormatBalance();

function App() {
  return (
    <ChakraProvider>
      <Box width="100vw" maxWidth="100%" overflowX="hidden">
        <ApiProvider>
          <Router>
            <Layout>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/blocks" element={<BlocksPage />} />
              <Route path="/block/:blockId" element={<BlockPage />} />
              <Route path="/account/:address" element={<AccountPage />} />
              <Route path="/tfchain" element={<TFChainPage />} />
              </Routes>
            </Layout>
          </Router>
        </ApiProvider>
      </Box>
    </ChakraProvider>
  );
}

export default App;
