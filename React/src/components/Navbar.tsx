import React from 'react';
import { Menu, X, Ticket } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { connectWallet, account } = useWeb3();

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Ticket className="h-8 w-8 text-purple-600 rotate-45" />
            <span className="ml-2 text-xl font-bold text-gray-900">NFTix</span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="#events" className="text-gray-700 hover:text-purple-600 transition-colors">Events</a>
              <a href="#marketplace" className="text-gray-700 hover:text-purple-600 transition-colors">Marketplace</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">How it Works</a>
              <button 
                onClick={connectWallet}
                className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
              >
                {account ? shortenAddress(account) : 'Connect Wallet'}
              </button>
            </div>
          </div>
          
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <a href="#events" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Events</a>
            <a href="#marketplace" className="block px-3 py-2 text-gray-700 hover:text-purple-600">Marketplace</a>
            <a href="#how-it-works" className="block px-3 py-2 text-gray-700 hover:text-purple-600">How it Works</a>
            <button 
              onClick={connectWallet}
              className="w-full mt-2 bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700"
            >
              {account ? shortenAddress(account) : 'Connect Wallet'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}