import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectTicket } from '../redux/slices/ticketsSlice';

const TicketDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const selectedTicket = useAppSelector((state) => state.tickets.selectedTicket);
  const tickets = useAppSelector((state) => state.tickets.tickets);

  useEffect(() => {
    if (id) {
      dispatch(selectTicket(id));
    }
  }, [dispatch, id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (!selectedTicket) {
    return (
      <div className={`min-h-screen py-16 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl font-['Fira_Code']">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`py-16 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        <Link 
          to="/events" 
          className={`inline-flex items-center mb-8 font-['Fira_Code'] ${
            darkMode ? 'text-gray-300 hover:text-[#0288D1]' : 'text-gray-600 hover:text-[#0288D1]'
          }`}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Ticket Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={`relative rounded-2xl overflow-hidden shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <img 
                src={selectedTicket.imageUrl} 
                alt={selectedTicket.eventName}
                className="w-full h-auto"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-white text-xl font-bold mb-2 font-['Fira_Code']">
                      #{selectedTicket.id}
                    </h2>
                    <p className="text-white/80 text-sm font-['Fira_Code']">
                      NFT Ticket
                    </p>
                  </div>
                  <div className="bg-[#0288D1] px-4 py-2 rounded-full">
                    <p className="text-white font-medium font-['Fira_Code']">
                      {selectedTicket.price}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Ticket Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className={`p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-[#E0F7FA]'}`}>
              <h1 className={`text-3xl font-bold mb-6 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedTicket.eventName}
              </h1>

              <div className="space-y-6 mb-8">
                <div className="flex items-start">
                  <Calendar size={20} className="mt-1 mr-4 flex-shrink-0 text-[#0288D1]" />
                  <div>
                    <p className={`font-medium mb-1 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Date
                    </p>
                    <p className={`font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {formatDate(selectedTicket.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin size={20} className="mt-1 mr-4 flex-shrink-0 text-[#0288D1]" />
                  <div>
                    <p className={`font-medium mb-1 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Venue
                    </p>
                    <p className={`font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedTicket.venue}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock size={20} className="mt-1 mr-4 flex-shrink-0 text-[#0288D1]" />
                  <div>
                    <p className={`font-medium mb-1 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Status
                    </p>
                    <p className={`font-['Fira_Code'] px-3 py-1 rounded-full inline-block ${
                      darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                    }`}>
                      Available
                    </p>
                  </div>
                </div>
              </div>

              <div className={`mb-8 pb-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <h2 className={`text-xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Description
                </h2>
                <p className={`font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedTicket.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  className={`flex-1 px-6 py-3 rounded-lg font-medium font-['Fira_Code'] transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-[#0288D1] text-white hover:bg-[#0277BD]' 
                      : 'bg-[#0288D1] text-white hover:bg-[#0277BD]'
                  }`}
                >
                  Buy Ticket
                </button>
                <button 
                  className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium font-['Fira_Code'] transition-colors duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ExternalLink size={18} className="mr-2" />
                  View on Blockchain
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsPage;