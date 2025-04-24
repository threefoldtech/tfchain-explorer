import { ApiPromise } from '@polkadot/api';

export interface BlockData {
  number: string;
  hash: string;
  parentHash: string;
  stateRoot: string;
  extrinsicsRoot: string;
  author?: string;
  timestamp?: string;
  extrinsics: ExtrinsicData[];
  events?: EventData[];
}

export interface ExtrinsicData {
  hash: string;
  method: string;
  section: string;
  args: Record<string, any>;
  signer?: string;
  nonce?: string;
  success?: boolean;
  timestamp?: string;
}

export interface EventData {
  section: string;
  method: string;
  phase: string;
  data: Record<string, any>;
  topics?: string[];
}

export interface AccountData {
  address: string;
  balance: string;
  nonce: string;
  freeBalance?: string;
  reservedBalance?: string;
  lockedBalance?: string;
}

export interface NetworkInfo {
  name: string;
  tokenSymbol: string;
  tokenDecimals: number;
  ss58Format: number;
  genesisHash: string;
  chainType: string;
}

export interface ApiContextType {
  api: ApiPromise | null;
  isConnected: boolean;
  error: Error | null;
  endpoint: string;
  setEndpoint: (endpoint: string) => void;
}

// TFChain specific types
export interface TFGridFarm {
  id: number;
  name: string;
  farmId: number;
  twinId: number;
  pricingPolicyId: number;
  certificationType: string;
  publicIps: any[];
}

export interface TFGridNode {
  id: number;
  nodeId: number;
  farmId: number;
  twinId: number;
  resources: {
    hru: string;
    sru: string;
    cru: string;
    mru: string;
  };
  location: {
    country: string;
    city: string;
    latitude: string;
    longitude: string;
  };
  status: string;
  certificationType: string;
}

export interface TFGridTwin {
  id: number;
  twinId: number;
  accountId: string;
  ip: string;
}

export interface TFGridStats {
  totalNodes: number;
  totalFarms: number;
  totalTwins: number;
  totalContracts: number;
  totalPublicIps: number;
}
