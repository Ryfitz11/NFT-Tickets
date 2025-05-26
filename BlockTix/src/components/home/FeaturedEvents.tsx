import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import EventCard from '../ui/EventCard';

const FeaturedEvents: React.FC = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const featuredEvents = useAppSelector((state) => state.events.featuredEvents);

  return (
    <section className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            className={`text-3xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Featured Events
          </motion.h2>
          <motion.p 
            className={`max-w-2xl mx-auto text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover the hottest upcoming shows and secure your tickets as NFTs
          </motion.p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link 
            to="/events" 
            className={`inline-block px-8 py-3 rounded-full font-medium transition-transform duration-300 hover:scale-105 font-['Fira_Code'] ${
              darkMode 
                ? 'bg-[#0288D1] text-white' 
                : 'bg-[#0288D1] text-white'
            }`}
          >
            View All Events
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedEvents;