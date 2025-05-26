import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';
import Header from './Header';
import Footer from './Footer';

const MainLayout: React.FC = () => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);

  useEffect(() => {
    // Apply dark mode to the document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <Header />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;