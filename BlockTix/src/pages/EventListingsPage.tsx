import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { fetchEventAddresses, fetchEventDetails } from '../redux/slices/eventsSlice';
import { Web3Service } from '../services/web3';
import EventCard from '../components/ui/EventCard';

const EventListingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const { isConnected } = useAppSelector((state) => state.wallet);
  const { events, loading, error } = useAppSelector((state) => state.events);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWeb3Initialized, setIsWeb3Initialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      try {
        await Web3Service.initialize();
        setIsWeb3Initialized(true);
        setInitError(null);
      } catch (error) {
        console.error('Failed to initialize Web3:', error);
        setInitError('Failed to connect to blockchain. Please check your wallet connection.');
      }
    };

    if (isConnected && !isWeb3Initialized) {
      initializeWeb3();
    }
  }, [isConnected, isWeb3Initialized]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isWeb3Initialized) return;
      
      try {
        const resultAction = await dispatch(fetchEventAddresses()).unwrap();
        if (resultAction.length > 0) {
          await dispatch(fetchEventDetails(resultAction));
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    if (isConnected && isWeb3Initialized) {
      fetchEvents();
    }
  }, [dispatch, isConnected, isWeb3Initialized]);

  const filteredEvents = events.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (initError) {
    return (
      <div className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className={`text-lg font-['Fira_Code'] text-red-500 mb-4`}>
              {initError}
            </p>
            <button
              onClick={() => {
                setIsWeb3Initialized(false);
                setInitError(null);
              }}
              className={`px-6 py-2 rounded-lg font-['Fira_Code'] ${
                darkMode
                  ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
                  : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
              }`}
            >
              Retry Connection
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className={`text-3xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Browse Events
          </h1>
          <p className={`max-w-2xl mx-auto text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover upcoming events and secure your NFT tickets
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className={`flex flex-col md:flex-row gap-4 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-[#E0F7FA]'}`}>
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              </div>
              <input
                type="text"
                placeholder="Search events by name or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-lg outline-none font-['Fira_Code'] ${
                  darkMode 
                    ? 'bg-gray-700 text-white placeholder-gray-400 border border-gray-600'
                    : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300'
                }`}
              />
            </div>

            <button 
              className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium font-['Fira_Code'] ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Filter size={18} className="mr-2" />
              Filter
            </button>
          </div>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 size={40} className="animate-spin text-[#0288D1] mb-4" />
            <p className={`text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading events...
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className={`text-lg font-['Fira_Code'] text-red-500 mb-4`}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`px-6 py-2 rounded-lg font-['Fira_Code'] ${
                darkMode
                  ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
                  : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
              }`}
            >
              Retry
            </button>
          </motion.div>
        ) : !isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className={`text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Please connect your wallet to view events
            </p>
          </motion.div>
        ) : filteredEvents.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} isWeb3Initialized={isWeb3Initialized} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`text-center py-12 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            <p className="text-xl font-['Fira_Code']">No events found matching your search.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EventListingsPage;