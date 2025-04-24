import { useState, useEffect } from 'react';
import { ApiPromise } from '@polkadot/api';
import { BlockData } from '../types';

export const useLatestBlocks = (api: ApiPromise | null, count = 10) => {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!api || !api.isConnected) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const fetchBlocks = async () => {
      try {
        setLoading(true);
        
        // Get the latest block header
        const lastHeader = await api.rpc.chain.getHeader();
        const latestBlockNumber = lastHeader.number.unwrap().toNumber();
        
        // Fetch the last 'count' blocks
        const blockPromises = [];
        for (let i = 0; i < count; i++) {
          const blockNumber = Math.max(0, latestBlockNumber - i);
          blockPromises.push(fetchBlockData(api, blockNumber));
        }
        
        const blockData = await Promise.all(blockPromises);
        setBlocks(blockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to new blocks
    const subscribeNewHeads = async () => {
      try {
        unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
          const blockNumber = header.number.unwrap().toNumber();
          const newBlock = await fetchBlockData(api, blockNumber);
          
          setBlocks(prevBlocks => {
            // Add the new block at the beginning and remove the last one if we exceed the count
            const updatedBlocks = [newBlock, ...prevBlocks];
            if (updatedBlocks.length > count) {
              updatedBlocks.pop();
            }
            return updatedBlocks;
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    };

    fetchBlocks().then(subscribeNewHeads);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [api, count]);

  return { blocks, loading, error };
};

export const useBlock = (api: ApiPromise | null, blockHashOrNumber: string | number | null) => {
  const [block, setBlock] = useState<BlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!api || !api.isConnected || blockHashOrNumber === null) {
      setLoading(false);
      return;
    }

    const fetchBlock = async () => {
      try {
        setLoading(true);
        
        let blockNumber: number;
        let blockHash: any;
        
        if (typeof blockHashOrNumber === 'number') {
          blockNumber = blockHashOrNumber;
          blockHash = await api.rpc.chain.getBlockHash(blockNumber);
        } else if (blockHashOrNumber.startsWith('0x')) {
          // It's a hash
          blockHash = blockHashOrNumber;
          try {
            const header = await api.rpc.chain.getHeader(blockHash);
            blockNumber = header.number.unwrap().toNumber();
          } catch (err) {
            console.error('Error getting header for hash', blockHashOrNumber, err);
            throw new Error(`Block with hash ${blockHashOrNumber} not found`);
          }
        } else {
          // It's a number as string
          blockNumber = parseInt(blockHashOrNumber, 10);
          if (isNaN(blockNumber)) {
            throw new Error(`Invalid block ID: ${blockHashOrNumber}`);
          }
          blockHash = await api.rpc.chain.getBlockHash(blockNumber);
        }
        
        const blockData = await fetchBlockData(api, blockNumber);
        setBlock(blockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setBlock(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlock();
  }, [api, blockHashOrNumber]);

  return { block, loading, error };
};

// Helper function to fetch block data
async function fetchBlockData(api: ApiPromise, blockNumber: number): Promise<BlockData> {
  // Get block hash for the specified block number
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  
  // Get the block with extended information
  const apiAt = await api.at(blockHash);
  const [{ block }, timestamp, systemEvents] = await Promise.all([
    api.rpc.chain.getBlock(blockHash),
    apiAt.query.timestamp?.now ? apiAt.query.timestamp.now() : null,
    apiAt.query.system.events(),
  ]);
  
  // Process events
  const events = systemEvents.map((event: any) => {
    const { event: { data, method, section }, phase } = event;
    return {
      section,
      method,
      phase: phase.toString(),
      data: data.toHuman() as Record<string, any>,
      topics: event.topics ? event.topics.map((t: any) => t.toHex()) : undefined,
    };
  });
  
  // Process extrinsics
  const extrinsics = block.extrinsics.map((extrinsic, index) => {
    const { method, section, args } = extrinsic.method.toHuman() as any;
    
    // Find events related to this extrinsic
    const extrinsicEvents = systemEvents.filter((event: any) => {
      const { phase } = event;
      return phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index);
    });
    
    // Check if extrinsic was successful
    const success = extrinsicEvents.some(
      (event: any) => api.events.system.ExtrinsicSuccess.is(event.event)
    );
    
    return {
      hash: extrinsic.hash.toHex(),
      method,
      section,
      args,
      signer: extrinsic.signer.toString() !== '' ? extrinsic.signer.toString() : undefined,
      nonce: extrinsic.nonce.toString(),
      success,
    };
  });

  // Try to get the author from the block header or digest
  let author;
  try {
    // @ts-ignore - Some Substrate chains have author in block
    if (block.author) {
      // @ts-ignore
      author = block.author.toString();
    } else if (block.header.digest && block.header.digest.logs) {
      // For simplicity, we'll skip complex author extraction
      // TFChain may have different author extraction logic
      author = undefined;
    }
  } catch (error) {
    console.warn('Could not extract author from block', error);
  }

  return {
    number: blockNumber.toString(),
    hash: blockHash.toHex(),
    parentHash: block.header.parentHash.toHex(),
    stateRoot: block.header.stateRoot.toHex(),
    extrinsicsRoot: block.header.extrinsicsRoot.toHex(),
    author,
    timestamp: timestamp ? timestamp.toString() : undefined,
    extrinsics,
    events,
  };
}
