import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import { Ticket } from '../../types';
import { Web3Service } from '../../services/web3';

interface TicketCardProps {
  ticket: Ticket;
  isWeb3Initialized: boolean;
}

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const TicketCard: React.FC<TicketCardProps> = ({ ticket, isWeb3Initialized }) => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const [imageUrl, setImageUrl] = useState<string>(FALLBACK_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    const fetchTicketMetadata = async () => {
      if (!isWeb3Initialized) {
        return;
      }

      try {
        setIsLoading(true);
        setImageError(false);

        // Get the event contract instance
        const eventContract = Web3Service.getEventContract(ticket.id);
        
        // Fetch the IPFS path from the contract
        const ipfsPath = await eventContract.getEventImageIPFSPath();
        
        // Convert IPFS path to HTTP URL
        const httpUrl = ipfsPath.replace('ipfs://', IPFS_GATEWAY);
        setImageUrl(httpUrl);
      } catch (error) {
        console.error('Error fetching ticket metadata:', error);
        setImageError(true);
        setImageUrl(FALLBACK_IMAGE);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketMetadata();
  }, [ticket.id, isWeb3Initialized]);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageUrl(FALLBACK_IMAGE);
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className={`rounded-lg overflow-hidden shadow-md ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
    >
      <div className="relative">
        {isLoading ? (
          <div className="w-full h-48 flex items-center justify-center bg-gray-800">
            <Loader2 size={32} className="text-[#0288D1] animate-spin" />
          </div>
        ) : (
          <>
            <img 
              src={imageUrl}
              alt={ticket.eventName}
              className="w-full h-48 object-cover"
              loading="lazy"
              onError={handleImageError}
            />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-60"></div>
            <div className="absolute top-4 right-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                darkMode ? 'bg-[#0288D1] text-white' : 'bg-[#0288D1] text-white'
              }`}>
                {ticket.price}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 font-['Fira_Code']">{ticket.eventName}</h3>
        
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar size={16} className="mr-2 text-[#0288D1]" />
            <span className="font-['Fira_Code']">{formatDate(ticket.date)}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin size={16} className="mr-2 text-[#0288D1]" />
            <span className="font-['Fira_Code']">{ticket.venue}</span>
          </div>
        </div>
        
        <Link 
          to={`/tickets/${ticket.id}`}
          className={`block w-full text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
            darkMode 
              ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]' 
              : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
          }`}
        >
          View Ticket
        </Link>
      </div>
    </motion.div>
  );
};

export default TicketCard;