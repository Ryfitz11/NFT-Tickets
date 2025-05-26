import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../redux/hooks';
import { connectWallet } from '../redux/slices/walletSlice';
import { fetchUserTickets, clearTickets } from '../redux/slices/ticketsSlice';
import { Web3Service } from '../services/web3';
import TicketCard from '../components/ui/TicketCard';

const MyTicketsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { tickets, loading, error } = useAppSelector((state) => state.tickets);
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
    const fetchTickets = async () => {
      if (!address || !isWeb3Initialized) return;
      await dispatch(fetchUserTickets(address));
    };

    if (isConnected && isWeb3Initialized) {
      fetchTickets();
    } else {
      dispatch(clearTickets());
    }

    return () => {
      dispatch(clearTickets());
    };
  }, [dispatch, address, isConnected, isWeb3Initialized]);

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  return (
    <div className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className={`text-3xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            My Tickets
          </h1>
          <p className={`max-w-2xl mx-auto text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your NFT ticket collection
          </p>
        </motion.div>

        {!isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`mb-12 p-8 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-[#E0F7FA]'}`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-[#0288D1]/10">
              <Wallet size={32} className="text-[#0288D1]" />
            </div>
            <h2 className={`text-xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Connect Your Wallet
            </h2>
            <p className={`max-w-md mx-auto mb-6 font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Connect your wallet to view and manage your NFT tickets
            </p>
            <button 
              onClick={handleConnectWallet}
              className={`px-6 py-3 rounded-lg font-medium font-['Fira_Code'] transition-colors duration-300 ${
                darkMode 
                  ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]' 
                  : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
              }`}
            >
              Connect Wallet
            </button>
          </motion.div>
        ) : loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 size={40} className="animate-spin text-[#0288D1] mb-4" />
            <p className={`text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading your tickets...
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
              onClick={() => {
                setIsWeb3Initialized(false);
                setInitError(null);
                dispatch(clearTickets());
              }}
              className={`px-6 py-2 rounded-lg font-['Fira_Code'] ${
                darkMode
                  ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
                  : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
              }`}
            >
              Retry
            </button>
          </motion.div>
        ) : tickets.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {tickets.map((ticket) => (
              <TicketCard 
                key={ticket.id} 
                ticket={ticket}
                isWeb3Initialized={isWeb3Initialized}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center py-12"
          >
            <p className={`text-xl font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You don't have any tickets yet
            </p>
            <button
              onClick={() => window.location.href = '/events'}
              className={`mt-4 px-6 py-3 rounded-lg font-medium font-['Fira_Code'] ${
                darkMode 
                  ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]' 
                  : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
              }`}
            >
              Browse Events
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;