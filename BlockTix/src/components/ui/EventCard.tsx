import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import { Event } from '../../types';

interface EventCardProps {
  event: Event;
  isWeb3Initialized: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.3 } }}
      className={`rounded-lg overflow-hidden shadow-md ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="relative">
        <img 
          src={event.imageUrl} 
          alt={event.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-full p-4">
          <p className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#0288D1] text-white mb-2`}>
            {event.price}
          </p>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-semibold mb-2 font-['Fira_Code']">{event.name}</h3>
        
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm">
            <Calendar size={16} className="mr-2 text-[#0288D1]" />
            <span className="font-['Fira_Code']">{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin size={16} className="mr-2 text-[#0288D1]" />
            <span className="font-['Fira_Code']">{event.venue}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm font-['Fira_Code']">
            <span className={`${darkMode ? 'text-[#0288D1]' : 'text-[#0288D1]'}`}>
              {event.availableTickets}
            </span> / {event.totalTickets} tickets left
          </div>
          <Link 
            to={`/events/${event.id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
              darkMode 
                ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]' 
                : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
            }`}
          >
            View Event
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;