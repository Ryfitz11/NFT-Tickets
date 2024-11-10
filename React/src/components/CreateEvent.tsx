import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-hot-toast';
import { Calendar, Ticket, DollarSign } from 'lucide-react';

export default function CreateEvent() {
  const { deployEventContract, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    totalTickets: '',
    ticketPrice: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const timestamp = Math.floor(new Date(formData.date).getTime() / 1000);
      toast.loading('Deploying event contract...');
      
      const eventAddress = await deployEventContract(
        formData.name,
        timestamp,
        parseInt(formData.totalTickets),
        formData.ticketPrice
      );

      toast.success('Event contract deployed successfully!');
      toast.success(`Contract Address: ${eventAddress}`);
      
      setFormData({
        name: '',
        date: '',
        totalTickets: '',
        ticketPrice: '',
      });
    } catch (error) {
      toast.error('Failed to deploy event contract');
      console.error(error);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-indigo-50" id="create-event">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">
            Create Event
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Deploy a New Event Contract
          </p>
          <p className="mt-4 text-lg text-gray-500">
            Create your event and start selling NFT tickets in minutes
          </p>
        </div>

        <div className="mt-12">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter event name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Event Date & Time
                </label>
                <div className="mt-1">
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Tickets
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Ticket className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.totalTickets}
                      onChange={(e) =>
                        setFormData({ ...formData, totalTickets: e.target.value })
                      }
                      className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="Number of tickets"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ticket Price (ETH)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.ticketPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, ticketPrice: e.target.value })
                      }
                      className="pl-10 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="0.00"
                      required
                      step="0.000000000000000001"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 ease-in-out transform hover:scale-[1.02]"
                >
                  Deploy Event Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}