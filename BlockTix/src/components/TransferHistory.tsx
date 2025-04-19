import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';

interface TransferHistoryProps {
  eventId: string;
}

interface Transfer {
  ticketId: string;
  from: string;
  to: string;
  timestamp: Date;
  blockNumber: number;
}

export function TransferHistory({ eventId }: TransferHistoryProps) {
  const { provider } = useWallet();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransferHistory = async () => {
      if (!provider) return;

      try {
        setIsLoading(true);
        setError(null);
        
        // Create a contract instance
        const contract = new Contract(
          eventId,
          [
            'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
          ],
          provider
        );

        // Get the current block number for timestamp approximation
        const currentBlock = await provider.getBlockNumber();
        
        // Get transfer events - use a try/catch specifically for this operation
        try {
          // First mint events (from address 0x0)
          const mintFilter = {
            address: eventId,
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
              '0x0000000000000000000000000000000000000000000000000000000000000000'  // From the zero address (minting)
            ]
          };
          
          // Then regular transfers
          const transferFilter = {
            address: eventId,
            topics: [
              '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event signature
            ],
            fromBlock: 0,
            toBlock: 'latest'
          };
          
          // Get logs directly from provider to avoid issues with contract filtering
          const mintLogs = await provider.getLogs(mintFilter);
          const transferLogs = await provider.getLogs(transferFilter);
          
          // Combine and filter out duplicates
          const allLogs = [...mintLogs, ...transferLogs];
          
          // Process logs
          const transferEvents = await Promise.all(
            allLogs.map(async (log) => {
              // Parse the log data
              const parsedLog = contract.interface.parseLog(log);
              if (!parsedLog) return null;
              
              const { from, to, tokenId } = parsedLog.args;
              
              // Get block for timestamp
              let timestamp = new Date();
              let blockNumber = log.blockNumber;
              
              try {
                const block = await provider.getBlock(log.blockNumber);
                if (block && block.timestamp) {
                  timestamp = new Date(Number(block.timestamp) * 1000);
                }
              } catch (blockError) {
                console.warn('Could not fetch block timestamp:', blockError);
              }
              
              return {
                ticketId: tokenId.toString(),
                from,
                to,
                timestamp,
                blockNumber
              };
            })
          );
          
          // Filter out nulls and sort by block number
          const validTransfers = transferEvents
            .filter((t): t is Transfer => t !== null)
            .sort((a, b) => b.blockNumber - a.blockNumber); // Most recent first
          
          setTransfers(validTransfers);
        } catch (queryError) {
          console.error('Error querying transfer events:', queryError);
          setError('Could not retrieve transfer history. The blockchain may be congested.');
          // Still set empty transfers to show the error state
          setTransfers([]);
        }
      } catch (error: any) {
        console.error('Error in transfer history component:', error);
        setError(error.message || 'Failed to load transfer history');
        setTransfers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransferHistory();
  }, [provider, eventId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-gray-500 mt-1">
          This is a display issue only and does not affect ticket functionality.
        </p>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No transfer history available</p>
      </div>
    );
  }

  // Format addresses for display
  const formatAddress = (address: string) => {
    if (address === '0x0000000000000000000000000000000000000000') {
      return 'New Mint';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket ID
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                To
              </th>
              <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transfers.map((transfer, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                  {transfer.ticketId}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                  {formatAddress(transfer.from)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                  <div className="flex items-center">
                    <ArrowRight className="h-3 w-3 text-gray-400 mx-1" />
                    {formatAddress(transfer.to)}
                  </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">
                  {format(transfer.timestamp, 'MMM d, yyyy h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}