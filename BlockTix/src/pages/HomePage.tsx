import React from 'react';
import Hero from '../components/home/Hero';
import FeaturedEvents from '../components/home/FeaturedEvents';
import HowItWorks from '../components/home/HowItWorks';

const HomePage: React.FC = () => {
  return (
    <div>
      <Hero />
      <FeaturedEvents />
      <HowItWorks />
    </div>
  );
};

export default HomePage;