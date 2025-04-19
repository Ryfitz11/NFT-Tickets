import React, { useState, useEffect } from 'react';
import { Calendar, Ticket as TicketIcon, DollarSign, RefreshCw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '../types';
import { MyTickets } from './MyTickets';
import { Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';

interface EventCardProps {
  event: Event;
  onBuyTicket: (eventId: string) => void;
}

const EVENT_ABI = [
  "function eventDetails() view returns (string, uint256, uint256, uint256, bool)",
  "function claimRefund()",
  "function getRefundStatus(address) view returns (bool)",
  "function ticketsBought(address) view returns (uint256)"
];

export function EventCard({ event, onBuyTicket }: EventCardProps) {
  const { provider, address } = useWallet();
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [isCanceled, setIsCanceled] = useState(event.isCanceled || false);
  const [isClaimingRefund, setIsClaimingRefund] = useState(false);
  const [hasRefunded, setHasRefunded] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const available = event.totalTickets - event.ticketsSold;
  const isEventPassed = new Date() > event.date;

  useEffect(() => {
    const fetchEventStatus = async () => {
      if (!provider) return;

      try {
        const contract = new Contract(event.id, EVENT_ABI, provider);
        const details = await contract.eventDetails();
        setIsCanceled(details[4]); // isCanceled is the fifth return value

        if (address) {
          const refundStatus = await contract.getRefundStatus(address);
          setHasRefunded(refundStatus);
          
          const tickets = await contract.ticketsBought(address);
          setTicketCount(Number(tickets));
        }
      } catch (error) {
        console.error('Error fetching event status:', error);
      }
    };

    fetchEventStatus();
  }, [provider, address, event.id, event.isCanceled]);

  const handleClaimRefund = async () => {
    if (!provider || !address) {
      return;
    }

    try {
      setIsClaimingRefund(true);
      const signer = await provider.getSigner();
      const contract = new Contract(event.id, EVENT_ABI, signer);
      
      const tx = await contract.claimRefund();
      await tx.wait();
      
      setHasRefunded(true);
      setIsClaimingRefund(false);
    } catch (error: any) {
      console.error('Error claiming refund:', error);
      setIsClaimingRefund(false);
    }
  };

  // Format the date and time
  const formatDateTime = (date: Date) => {
    return format(date, 'PPP p'); // e.g., "Jan 1, 2025 6:00 PM"
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={event.imageUrl}
        alt={event.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold">{event.name}</h3>
          {isCanceled && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Canceled
            </span>
          )}
        </div>
        
        <div className="mb-4">
          <div className={`${showFullDescription ? '' : 'line-clamp-3'} text-gray-600`}>
            {event.description}
          </div>
          {event.description.length > 120 && (
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mt-1"
            >
              {showFullDescription ? (
                <>
                  Show Less <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Show More <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(event.date, 'PPP')}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{format(event.date, 'p')}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <TicketIcon className="h-4 w-4 mr-2" />
            <span>{available} tickets available</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>{event.price} ETH</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {isCanceled ? (
            ticketCount > 0 && !hasRefunded ? (
              <button
                onClick={handleClaimRefund}
                disabled={isClaimingRefund}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isClaimingRefund ? 'animate-spin' : ''}`} />
                {isClaimingRefund ? 'Processing Refund...' : 'Claim Refund'}
              </button>
            ) : hasRefunded ? (
              <p className="text-center text-sm text-gray-500">Refund claimed</p>
            ) : null
          ) : (
            <button
              onClick={() => onBuyTicket(event.id)}
              disabled={available === 0 || isEventPassed}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isEventPassed ? 'Event Ended' : available === 0 ? 'Sold Out' : 'Buy Ticket'}
            </button>
          )}
          
          <button
            onClick={() => setShowMyTickets(!showMyTickets)}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showMyTickets ? 'Hide My Tickets' : 'View My Tickets'}
          </button>
        </div>

        {showMyTickets && (
          <div className="mt-4 border-t pt-4">
            <MyTickets event={event} />
          </div>
        )}
      </div>
    </div>
  );
}