import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Github, Twitter, Disc as Discord } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';

const Footer: React.FC = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  return (
    <footer className={`py-12 ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-[#E0F7FA] text-gray-800'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Ticket size={24} className="text-[#0288D1]" />
              <span className="text-xl font-bold font-['Fira_Code']">BlockTix</span>
            </Link>
            <p className="text-sm mb-6 font-['Fira_Code']">
              A decentralized ticketing platform using NFTs for secure, verifiable concert tickets on the blockchain.
            </p>
            <div className="flex space-x-4">
              <a href="#" className={`hover:text-[#0288D1] transition-colors duration-300`}>
                <Twitter size={20} />
              </a>
              <a href="#" className={`hover:text-[#0288D1] transition-colors duration-300`}>
                <Discord size={20} />
              </a>
              <a href="#" className={`hover:text-[#0288D1] transition-colors duration-300`}>
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-['Fira_Code']">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link to="/venue-dashboard" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Venue Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-['Fira_Code']">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Smart Contracts
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  NFT Standards
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Tutorials
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 font-['Fira_Code']">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-[#0288D1] transition-colors duration-300 font-['Fira_Code']">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-sm text-center font-['Fira_Code']">
            &copy; {new Date().getFullYear()} BlockTix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;