
import { Shield, Repeat, Ticket, Coins } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      title: 'Secure & Authentic',
      description: 'Each ticket is a unique NFT, impossible to counterfeit and easily verifiable on the blockchain.'
    },
    {
      icon: <Repeat className="h-6 w-6 text-purple-600" />,
      title: 'Easy Transfers',
      description: 'Transfer or resell your tickets securely through our marketplace with just a few clicks.'
    },
    {
      icon: <Ticket className="h-6 w-6 text-purple-600" />,
      title: 'Collectible Memories',
      description: 'Keep your tickets as digital collectibles, complete with unique artwork and event memories.'
    },
    {
      icon: <Coins className="h-6 w-6 text-purple-600" />,
      title: 'Fair Pricing',
      description: 'Smart contracts ensure transparent pricing and eliminate scalping through controlled resale limits.'
    }
  ];

  return (
    <div className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            The Future of Event Ticketing
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Experience events like never before with NFT-powered digital tickets that offer more than just entry.
          </p>
        </div>

        <div className="mt-20">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <div key={index} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-white">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}