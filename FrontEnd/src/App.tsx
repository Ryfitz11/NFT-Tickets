import React, { useState, useEffect, useMemo } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { EventCard } from './components/EventCard';
import { CreateEventForm } from './components/create-event/CreateEventForm';
import { EventManagement } from './components/EventManagement';
import { Ticket, Plus, X, RefreshCw, LayoutDashboard, Menu, Clock, History } from 'lucide-react';
import { useEventFactory } from './contracts/useEventFactory';
import { Contract } from 'ethers';
import { toast } from 'react-hot-toast';
import { useWallet } from './hooks/useWallet';
import { Event } from './types';

function App() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'management'>('marketplace');
  const { events, isLoading, refreshEvents } = useEventFactory();
  const { provider, address } = useWallet();
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isLoadingMyEvents, setIsLoadingMyEvents] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);

  // Separate events into upcoming and past
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();
    return {
      upcomingEvents: events.filter(event => new Date(event.date) > now),
      pastEvents: events.filter(event => new Date(event.date) <= now)
    };
  }, [events]);

  // Fetch my events
  useEffect(() => {
    async function fetchMyEvents() {
      if (!provider || !address || !events.length) {
        setMyEvents([]);
        return;
      }

      setIsLoadingMyEvents(true);
      try {
        const ownedEvents = [];
        for (const event of events) {
          try {
            const contract = new Contract(
              event.id,
              ['function owner() public view returns (address)'],
              provider
            );
            const owner = await contract.owner();
            if (owner.toLowerCase() === address.toLowerCase()) {
              ownedEvents.push(event);
            }
          } catch (error) {
            console.error(`Error checking ownership for event ${event.id}:`, error);
          }
        }
        setMyEvents(ownedEvents);
      } catch (error) {
        console.error('Error fetching owned events:', error);
      } finally {
        setIsLoadingMyEvents(false);
      }
    }

    fetchMyEvents();
  }, [provider, address, events]);

  const handleBuyTicket = async (eventId: string) => {
    if (!provider || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        toast.error('Event not found');
        return;
      }

      const signer = await provider.getSigner();
      const eventContract = new Contract(
        eventId,
        [
          'function buyTicket() public payable',
          'function ticketPrice() public view returns (uint256)'
        ],
        signer
      );

      const price = await eventContract.ticketPrice();
      const tx = await eventContract.buyTicket({ value: price });
      toast.loading('Purchasing ticket...');
      
      await tx.wait();
      toast.success('Ticket purchased successfully!');
      
      await refreshEvents();
    } catch (error: any) {
      console.error('Error buying ticket:', error);
      toast.error(error.message || 'Failed to buy ticket');
    }
  };

  const renderEvents = (eventList: Event[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {eventList.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onBuyTicket={handleBuyTicket}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <Ticket className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-xl sm:text-2xl font-bold text-gray-900">NFT Ticket Marketplace</h1>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Navigation and Actions */}
            <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto`}>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => {
                    setActiveTab('marketplace');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'marketplace'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Marketplace
                </button>
                <button
                  onClick={() => {
                    setActiveTab('management');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'management'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 inline-block mr-1" />
                  My Events
                </button>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => {
                    refreshEvents();
                    setIsMobileMenuOpen(false);
                  }}
                  className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </button>
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showCreateForm ? (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 w-full max-w-4xl">
              <div className="relative bg-white rounded-lg shadow-xl">
                <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="text-xl font-semibold">Create New Event</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <div className="p-6">
                  <CreateEventForm onSuccess={() => {
                    setShowCreateForm(false);
                    refreshEvents();
                  }} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isLoading || isLoadingMyEvents ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : activeTab === 'marketplace' ? (
              <div className="space-y-8">
                {/* Upcoming Events Section */}
                <div>
                  <div className="flex items-center mb-4">
                    <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
                  </div>
                  {upcomingEvents.length > 0 ? (
                    renderEvents(upcomingEvents)
                  ) : (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                      <p className="mt-2 text-sm text-gray-500">Check back later for new events</p>
                    </div>
                  )}
                </div>

                {/* Past Events Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <History className="h-5 w-5 text-gray-600 mr-2" />
                      <h2 className="text-xl font-bold text-gray-900">Past Events</h2>
                    </div>
                    <button
                      onClick={() => setShowPastEvents(!showPastEvents)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {showPastEvents ? 'Hide' : 'Show'} Past Events
                    </button>
                  </div>
                  {showPastEvents && pastEvents.length > 0 && (
                    <div className="opacity-75">
                      {renderEvents(pastEvents)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Events</h2>
                {myEvents.length > 0 ? (
                  myEvents.map(event => (
                    <EventManagement
                      key={event.id}
                      event={event}
                      onWithdraw={refreshEvents}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-900">No events created yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Create your first event to start selling tickets
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;