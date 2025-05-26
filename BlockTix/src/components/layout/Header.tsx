import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Ticket, Search, Moon, Sun, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleDarkMode } from '../../redux/slices/themeSlice';
import { connectWallet, disconnectWallet } from '../../redux/slices/walletSlice';
import { TARGET_NETWORK } from '../../config/contracts';

const Header: React.FC = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const { address, chainId, networkName, isConnected, isConnecting, error } = useAppSelector((state) => state.wallet);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'My Tickets', path: '/my-tickets' },
    { name: 'Venue Dashboard', path: '/venue-dashboard' }
  ];

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleConnectWallet = () => {
    dispatch(connectWallet());
  };

  const handleDisconnectWallet = () => {
    dispatch(disconnectWallet());
  };

  const isWrongNetwork = chainId && chainId !== TARGET_NETWORK.chainId;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen || searchOpen
          ? darkMode
            ? 'bg-gray-900 shadow-lg'
            : 'bg-white shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center mr-12">
            <Ticket 
              size={28} 
              className={`${darkMode ? 'text-[#0288D1]' : 'text-[#0288D1]'} transition-colors duration-300`} 
            />
            <span className={`text-xl font-bold font-['Fira_Code'] ml-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              BlockTix
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-['Fira_Code'] text-sm transition-colors duration-300 ${
                  location.pathname === link.path
                    ? darkMode
                      ? 'text-[#0288D1] font-semibold'
                      : 'text-[#0288D1] font-semibold'
                    : darkMode
                    ? 'text-gray-300 hover:text-[#0288D1]'
                    : 'text-gray-700 hover:text-[#0288D1]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 rounded-full transition-colors duration-300 ${
                darkMode
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-[#E0F7FA]'
              }`}
            >
              <Search 
                size={20} 
                className={darkMode ? 'text-gray-300' : 'text-gray-700'} 
              />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => dispatch(toggleDarkMode())}
              className={`p-2 rounded-full transition-colors duration-300 ${
                darkMode
                  ? 'hover:bg-gray-800'
                  : 'hover:bg-[#E0F7FA]'
              }`}
            >
              {darkMode ? (
                <Sun size={20} className="text-gray-300" />
              ) : (
                <Moon size={20} className="text-gray-700" />
              )}
            </button>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="hidden md:flex items-center space-x-2">
                {isWrongNetwork && (
                  <span className="text-red-500 text-sm font-['Fira_Code']">
                    Wrong Network
                  </span>
                )}
                <div className={`px-4 py-2 rounded-full text-sm font-['Fira_Code'] ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {networkName}
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className={`px-4 py-2 rounded-full text-sm font-['Fira_Code'] ${
                    darkMode
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {truncateAddress(address)}
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className={`hidden md:flex items-center px-5 py-2 rounded-full font-['Fira_Code'] font-medium text-sm ${
                  darkMode
                    ? 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-700'
                    : 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-300'
                } transition-colors duration-300`}
              >
                {isConnecting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full transition-colors duration-300"
            >
              {mobileMenuOpen ? (
                <X 
                  size={24} 
                  className={darkMode ? 'text-gray-300' : 'text-gray-700'} 
                />
              ) : (
                <Menu 
                  size={24} 
                  className={darkMode ? 'text-gray-300' : 'text-gray-700'} 
                />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <input
              type="text"
              placeholder="Search for events, tickets..."
              className={`w-full p-3 rounded-full outline-none ${
                darkMode
                  ? 'bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-[#0288D1]'
                  : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-300 focus:border-[#0288D1]'
              }`}
            />
          </motion.div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden mt-4 py-4 rounded-lg ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <nav className="flex flex-col space-y-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-['Fira_Code'] py-2 px-4 rounded-lg transition-colors duration-300 ${
                    location.pathname === link.path
                      ? darkMode
                        ? 'bg-gray-700 text-[#0288D1]'
                        : 'bg-[#E0F7FA] text-[#0288D1]'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-[#E0F7FA]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {isConnected ? (
                <div className="space-y-2">
                  {isWrongNetwork && (
                    <div className="px-4 py-2 text-red-500 text-sm font-['Fira_Code']">
                      Wrong Network - Please switch to {TARGET_NETWORK.name}
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-lg text-sm font-['Fira_Code'] ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {networkName}
                  </div>
                  <button
                    onClick={handleDisconnectWallet}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-['Fira_Code'] ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {truncateAddress(address)}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className={`w-full mt-4 py-3 rounded-lg font-['Fira_Code'] font-medium text-sm flex items-center justify-center ${
                    darkMode
                      ? 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-700'
                      : 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-300'
                  }`}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              )}
            </nav>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-red-500 text-white text-sm font-['Fira_Code']"
          >
            {error}
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;