import React from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, Ticket, Settings, Lock } from 'lucide-react';
import { useAppSelector } from '../redux/hooks';
import CreateEventForm from '../components/ui/CreateEventForm';

const VenueDashboardPage: React.FC = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const { isConnected } = useAppSelector((state) => state.wallet);

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
            Venue Dashboard
          </h1>
          <p className={`max-w-2xl mx-auto text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage your events and NFT tickets
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
              <Lock size={32} className="text-[#0288D1]" />
            </div>
            <h2 className={`text-xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Venue Access Required
            </h2>
            <p className={`max-w-md mx-auto mb-6 font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Connect your wallet to access the venue dashboard. Only registered venue owners can access this area.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                      <Building size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                    </div>
                    <h3 className={`ml-3 text-lg font-medium font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      My Venues
                    </h3>
                  </div>
                  <p className={`text-3xl font-bold mb-2 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    2
                  </p>
                  <p className={`text-sm font-['Fira_Code'] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Active venues
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                      <Ticket size={20} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
                    </div>
                    <h3 className={`ml-3 text-lg font-medium font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Active Events
                    </h3>
                  </div>
                  <p className={`text-3xl font-bold mb-2 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    5
                  </p>
                  <p className={`text-sm font-['Fira_Code'] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Current events
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
                      <Settings size={20} className={darkMode ? 'text-green-400' : 'text-green-600'} />
                    </div>
                    <h3 className={`ml-3 text-lg font-medium font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Total Sales
                    </h3>
                  </div>
                  <p className={`text-3xl font-bold mb-2 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    2.5 ETH
                  </p>
                  <p className={`text-sm font-['Fira_Code'] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    All-time revenue
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-lg mb-8 ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-xl font-bold mb-6 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New Event
                </h2>
                <CreateEventForm />
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default VenueDashboardPage;