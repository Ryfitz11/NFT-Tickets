import { useState, useCallback, useEffect } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import { FACTORY_ADDRESS, FACTORY_ABI } from './config';
import { useWallet } from '../hooks/useWallet';
import { toast } from 'react-hot-toast';
import { Event } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Event Ticket ABI
const EVENT_TICKET_ABI = [
  "function eventDetails() view returns (string, uint256, uint256, uint256, bool)",
  "function ticketPrice() view returns (uint256)",
];

export function useEventFactory() {
  const { provider, address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!provider) {
      setEvents([]); // Clear events when provider is not available
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching events from factory:', FACTORY_ADDRESS);
      const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, provider);
      const eventAddresses = await factory.getAllEvents();
      console.log('Found event addresses:', eventAddresses);

      // Fetch metadata from Supabase
      let metadata: Record<string, { image_url: string; description: string }> = {};
      if (isSupabaseConfigured() && supabase) {
        const { data: metadataResults } = await supabase
          .from('event_metadata')
          .select('event_address, image_url, description');
        
        if (metadataResults) {
          metadata = metadataResults.reduce((acc, item) => ({
            ...acc,
            [item.event_address.toLowerCase()]: {
              image_url: item.image_url,
              description: item.description
            }
          }), {});
        }
      }
      
      const eventPromises = eventAddresses.map(async (eventAddress: string) => {
        console.log('Fetching details for event:', eventAddress);
        try {
          const eventContract = new Contract(eventAddress, EVENT_TICKET_ABI, provider);
          
          // Get event details
          const details = await eventContract.eventDetails();
          const priceWei = await eventContract.ticketPrice();
          
          const eventMetadata = metadata[eventAddress.toLowerCase()] || {
            image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
            description: 'Event tickets available on the blockchain.'
          };

          return {
            id: eventAddress,
            name: details[0],
            date: new Date(Number(details[1]) * 1000),
            totalTickets: Number(details[2]),
            ticketsSold: Number(details[3]),
            isCanceled: details[4],
            price: formatEther(priceWei),
            imageUrl: eventMetadata.image_url,
            description: eventMetadata.description
          };
        } catch (error) {
          console.error('Error fetching event details for:', eventAddress, error);
          return null;
        }
      });

      const fetchedEvents = (await Promise.all(eventPromises)).filter((event): event is Event => event !== null);
      console.log('Fetched events:', fetchedEvents);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch events');
      setEvents([]); // Clear events on error
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    if (provider) {
      console.log('Provider available, fetching events');
      fetchEvents();
    } else {
      setEvents([]); // Clear events when provider becomes unavailable
    }
  }, [provider, fetchEvents]);

  const createEvent = useCallback(async ({
    name,
    symbol,
    eventName,
    date,
    totalTickets,
    ticketPrice,
    ticketLimit,
    imageUrl,
    description
  }: {
    name: string;
    symbol: string;
    eventName: string;
    date: number;
    totalTickets: number;
    ticketPrice: string;
    ticketLimit: number;
    imageUrl: string;
    description: string;
  }) => {
    if (!provider || !address) {
      toast.error('Please connect your wallet');
      return false;
    }

    setIsCreating(true);
    try {
      const signer = await provider.getSigner();
      const factory = new Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
      
      // Convert ticket price from ETH to Wei
      const ticketPriceWei = parseEther(ticketPrice);
      
      console.log('Creating event with params:', {
        name,
        symbol,
        eventName,
        date,
        totalTickets,
        ticketPriceWei: ticketPriceWei.toString(),
        ticketLimit
      });

      const tx = await factory.createEvent(
        name,
        symbol,
        eventName,
        date,
        totalTickets,
        ticketPriceWei,
        ticketLimit
      );
      
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed');

      // Get the event contract address from the event logs
      const eventCreatedLog = receipt.logs.find(log => {
        try {
          const parsedLog = factory.interface.parseLog(log);
          return parsedLog?.name === 'EventCreated';
        } catch {
          return false;
        }
      });

      if (eventCreatedLog) {
        const parsedLog = factory.interface.parseLog(eventCreatedLog);
        const eventContractAddress = parsedLog?.args?.eventContract;

        // Store metadata in Supabase
        if (isSupabaseConfigured() && supabase) {
          const { error: metadataError } = await supabase
            .from('event_metadata')
            .insert({
              event_address: eventContractAddress,
              image_url: imageUrl,
              description: description
            });

          if (metadataError) {
            console.error('Error storing event metadata:', metadataError);
            toast.error('Event created, but failed to store image URL');
          }
        }
      }
      
      toast.success('Event created successfully!');
      await fetchEvents(); // Refresh the events list
      return true;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
      return false;
    } finally {
      setIsCreating(false);
    }
  }, [provider, address, fetchEvents]);

  return {
    createEvent,
    events,
    isCreating,
    isLoading,
    refreshEvents: fetchEvents
  };
}