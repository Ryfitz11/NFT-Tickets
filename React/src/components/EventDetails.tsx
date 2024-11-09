import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Calendar, Users, Ticket } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EventDetails() {
  const { contract, isConnected } = useWeb3();
  const [eventDetails, setEventDetails] = useState({
    name: '',
    date: new Date(),
    totalTickets: 0,
    ticketsSold: 0,
    ticketPrice: '0',
  });

  useEffect(() => {
    if (contract) {
      fetchEventDetails();
    }
  }, [contract]);

  const fetchEventDetails = async () => {
    try {
      const [name, date, totalTickets, ticketsSold] = await contract!.getEventDetails();
      const price = await contract!.ticketPrice();
      
      setEventDetails({
        name,
        date: new Date(Number(date) * 1000),
        totalTickets: Number(totalTickets),
        ticketsSold: Number(ticketsSold),
        ticketPrice: ethers.formatEther(price),
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const buyTicket = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const tx = await contract!.buyTicket({
        value: ethers.parseEther(eventDetails.ticketPrice)
      });
      toast.loading('Purchasing ticket...');
      await tx.wait();
      toast.success('Ticket purchased successfully!');
      fetchEventDetails();
    } catch (error) {
      toast.error('Failed to purchase ticket');
      console.error(error);
    }
  };

  return (
    <div className="py-12 bg-white" id="event-details">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Event Details</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {eventDetails.name}
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {eventDetails.date.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Availability</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {eventDetails.ticketsSold} / {eventDetails.totalTickets}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Ticket className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {eventDetails.ticketPrice} ETH
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={buyTicket}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Buy Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}