import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { Event } from '../types';
import { TicketDisplay } from './TicketDisplay';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);

  useEffect(() => {
    const fetchTickets = async () => {
      if (!provider || !address) return;

      try {
        const contract = new Contract(event.id, TICKET_ABI, provider);
        const ticketIds = await contract.getUserTickets(address);
        
        const ticketStatuses = await Promise.all(
          ticketIds.map(async (id: bigint) => ({
            id: id.toString(),
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

  const nextTicket = () => {
    setCurrentTicketIndex((prev) => 
      prev === tickets.length - 1 ? 0 : prev + 1
    );
  };

  const previousTicket = () => {
    setCurrentTicketIndex((prev) => 
      prev === 0 ? tickets.length - 1 : prev - 1
    );
  };

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
    <div className="mt-6">
      {/* Ticket count indicator */}
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Ticket {currentTicketIndex + 1} of {tickets.length}
        </p>
      </div>

      {/* Ticket carousel */}
      <div className="relative">
        {tickets.length > 1 && (
          <>
            <button
              onClick={previousTicket}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={nextTicket}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </>
        )}

        {/* Ticket display */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentTicketIndex * 100}%)` }}
          >
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="w-full flex-shrink-0"
              >
                <TicketDisplay
                  event={event}
                  ticketId={ticket.id}
                  isUsed={ticket.isUsed}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Ticket navigation dots */}
        {tickets.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {tickets.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTicketIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  index === currentTicketIndex ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}