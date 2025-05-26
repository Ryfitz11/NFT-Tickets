import React from 'react';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

const Hero: React.FC = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <div className={`relative overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-white to-[#E0F7FA]'}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#0288D1] opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-[#0288D1] opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-2 bg-[#0288D1]/10 rounded-full mb-6">
              <Ticket size={20} className="text-[#0288D1] mr-2" />
              <span className={`text-sm font-medium font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                The Future of Ticketing is Here
              </span>
            </div>

            <motion.h1 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-['Fira_Code'] leading-tight ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="relative">
                <span className="relative z-10">Decentralized</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#0288D1]/20 rounded"></span>
              </span>{" "}
              Ticketing on the Blockchain
            </motion.h1>

            <motion.p 
              className={`text-lg mb-8 font-['Fira_Code'] ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Secure, transparent, and verifiable concert tickets as NFTs. 
              No more counterfeits or scalping. Take control of your ticketing experience.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link 
                to="/events" 
                className="px-8 py-3 rounded-full bg-[#0288D1] text-white font-medium text-lg transition-transform duration-300 hover:scale-105 hover:shadow-lg font-['Fira_Code']"
              >
                Browse Events
              </Link>
              <Link 
                to="/venue-dashboard" 
                className={`px-8 py-3 rounded-full font-medium text-lg transition-transform duration-300 hover:scale-105 font-['Fira_Code'] ${
                  darkMode 
                    ? 'bg-gray-800 text-white border border-[#0288D1]' 
                    : 'bg-white text-gray-900 border border-[#0288D1]'
                }`}
              >
                For Venues
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div 
          className={`max-w-4xl mx-auto mt-16 p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 ${
            darkMode ? 'bg-gray-800 bg-opacity-60' : 'bg-white bg-opacity-60 backdrop-blur-lg shadow-lg'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="text-center">
            <p className={`text-3xl font-bold mb-1 font-['Fira_Code'] text-[#0288D1]`}>10,000+</p>
            <p className={`text-sm font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tickets Minted</p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold mb-1 font-['Fira_Code'] text-[#0288D1]`}>250+</p>
            <p className={`text-sm font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Events</p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold mb-1 font-['Fira_Code'] text-[#0288D1]`}>50+</p>
            <p className={`text-sm font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Venue Partners</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;