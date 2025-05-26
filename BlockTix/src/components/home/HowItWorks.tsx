import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, ShoppingCart, Wallet } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';

const HowItWorks: React.FC = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  const steps = [
    {
      icon: <Wallet size={32} className="text-[#0288D1]" />,
      title: 'Connect Your Wallet',
      description: 'Link your crypto wallet to browse and purchase tickets as NFTs securely on the blockchain.'
    },
    {
      icon: <ShoppingCart size={32} className="text-[#0288D1]" />,
      title: 'Purchase Tickets',
      description: 'Buy tickets directly from venues or other users with transparent pricing and no hidden fees.'
    },
    {
      icon: <Ticket size={32} className="text-[#0288D1]" />,
      title: 'Manage Your Tickets',
      description: 'Store your NFT tickets safely in your wallet and use them for entry at the venue.'
    }
  ];

  return (
    <section className={`py-16 ${darkMode ? 'bg-gray-800' : 'bg-[#E0F7FA]'}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            className={`text-3xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className={`max-w-2xl mx-auto text-lg font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Simple, secure, and transparent ticketing on the blockchain
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className={`p-8 rounded-xl text-center ${
                darkMode ? 'bg-gray-700' : 'bg-white'
              } shadow-lg`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 bg-[#0288D1]/10">
                {step.icon}
              </div>
              <h3 className={`text-xl font-bold mb-4 font-['Fira_Code'] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {step.title}
              </h3>
              <p className={`font-['Fira_Code'] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;