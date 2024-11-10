import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { toast } from 'react-hot-toast';

export default function TicketTransfer() {
  const { contract, isConnected } = useWeb3();
  const [ticketId, setTicketId] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const tx = await contract!.transferTicket(ticketId, recipientAddress);
      toast.loading('Transferring ticket...');
      await tx.wait();
      toast.success('Ticket transferred successfully!');
      setTicketId('');
      setRecipientAddress('');
    } catch (error) {
      toast.error('Failed to transfer ticket');
      console.error(error);
    }
  };

  return (
    <div className="py-12 bg-gray-50" id="transfer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">
            Transfer Ticket
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Send Your Ticket to Someone Else
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleTransfer} className="space-y-6">
            <div>
              <label
                htmlFor="ticketId"
                className="block text-sm font-medium text-gray-700"
              >
                Ticket ID
              </label>
              <input
                type="number"
                id="ticketId"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Recipient Address
              </label>
              <input
                type="text"
                id="address"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Transfer Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
