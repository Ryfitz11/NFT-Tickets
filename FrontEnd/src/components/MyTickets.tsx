import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { Event } from '../types';
import { TicketDisplay } from './TicketDisplay';
import { Loader } from 'lucide-react';

interface MyTicketsProps {
  event: Event;
}

const TICKET_ABI = [
  "function getUserTickets(address user) view returns (uint256[])",
  "function getTicketStatus(uint256 ticketId) view returns (bool)",
];

export function MyTickets({ event }: MyTicketsProps) {
  const { provider, address } = useWallet();
  const [tickets, setTickets] = useState<{ id: string; isUsed: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!provider || !address) return;

      try {
        const contract = new Contract(event.id, TICKET_ABI, provider);
        const ticketIds = await contract.getUserTickets(address);
        
        const ticketStatuses = await Promise.all(
          ticketIds.map(async (id: bigint) => ({
            id: id.toString(), // Convert BigInt to string
            isUsed: await contract.getTicketStatus(id)
          }))
        );

        setTickets(ticketStatuses);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [provider, address, event.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You don't have any tickets for this event</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tickets.map((ticket) => (
        <TicketDisplay
          key={ticket.id}
          event={event}
          ticketId={ticket.id}
          isUsed={ticket.isUsed}
        />
      ))}
    </div>
  );
}