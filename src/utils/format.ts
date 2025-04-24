import { formatBalance } from '@polkadot/util';

// Initialize the formatter with default options
export const initFormatBalance = (decimals = 12, unit = 'DOT'): void => {
  formatBalance.setDefaults({
    decimals,
    unit,
  });
};

// Format a balance with proper units
export const formatCurrency = (balance: string | number, decimals = 12, unit = 'DOT'): string => {
  return formatBalance(balance, { withSi: true, withUnit: unit, decimals });
};

// Format a timestamp to a readable date
export const formatDate = (timestamp: number | Date): string => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toLocaleString();
};

// Shorten a hash for display
export const shortenHash = (hash: string, length = 6): string => {
  if (!hash || hash.length < (length * 2) + 3) {
    return hash || '';
  }
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
};

// Format a block number with commas
export const formatBlockNumber = (blockNumber: number | string): string => {
  return blockNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
