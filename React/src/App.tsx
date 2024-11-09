import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import EventDetails from './components/EventDetails';
import TicketTransfer from './components/TicketTransfer';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Navbar />
        <Hero />
        <Features />
        <EventDetails />
        <TicketTransfer />
      </div>
    </Web3Provider>
  );
}

export default App;