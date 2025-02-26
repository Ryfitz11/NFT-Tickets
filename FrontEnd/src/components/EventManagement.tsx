import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { Event } from '../types';
import { Contract, formatEther } from 'ethers';
import { toast } from 'react-hot-toast';
import { Coins, QrCode, Ban } from 'lucide-react';
import { TicketVerification } from './TicketVerification';

interface EventManagementProps {
  event: Event;
  onWithdraw: () => Promise<void>;
}

const EVENT_CONTRACT_ABI = [
  "function owner() view returns (address)",
  "function withdrawFunds()",
  "function ticketPrice() view returns (uint256)",
  "function ticketsSold() view returns (uint256)",
  "function cancelEvent()",
  "function eventDetails() view returns (string, uint256, uint256, uint256, bool)"
];

export function EventManagement({ event, onWithdraw }: EventManagementProps) {
  const { provider, address } = useWallet();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [contractBalance, setContractBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);

  const fetchEventStatus = async () => {
    if (!provider) return;
    
    try {
      const contract = new Contract(event.id, EVENT_CONTRACT_ABI, provider);
      const details = await contract.eventDetails();
      setIsCanceled(details[4]); // isCanceled is the fifth return value
    } catch (error) {
      console.error('Error fetching event status:', error);
    }
  };

  const fetchContractBalance = async () => {
    if (!provider) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await provider.getBalance(event.id);
      setContractBalance(formatEther(balance));
    } catch (error) {
      console.error('Error fetching contract balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    fetchEventStatus();
    fetchContractBalance();
    const interval = setInterval(fetchContractBalance, 5000);
    return () => clearInterval(interval);
  }, [provider, event.id]);

  const handleCancel = async () => {
    if (!provider || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone and will allow ticket holders to claim refunds.')) {
      return;
    }

    try {
      setIsCanceling(true);
      const signer = await provider.getSigner();
      const eventContract = new Contract(event.id, EVENT_CONTRACT_ABI, signer);

      const owner = await eventContract.owner();
      if (owner.toLowerCase() !== address.toLowerCase()) {
        toast.error('Only the event creator can cancel the event');
        return;
      }

      const tx = await eventContract.cancelEvent();
      const toastId = toast.loading('Canceling event...');
      
      await tx.wait();
      
      toast.dismiss(toastId);
      toast.success('Event canceled successfully');
      await fetchEventStatus();
      await onWithdraw(); // Refresh the event list
    } catch (error: any) {
      console.error('Error canceling event:', error);
      toast.error(error.message || 'Failed to cancel event');
    } finally {
      setIsCanceling(false);
    }
  };

  const handleWithdraw = async () => {
    if (!provider || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsWithdrawing(true);
      const signer = await provider.getSigner();
      const eventContract = new Contract(event.id, EVENT_CONTRACT_ABI, signer);

      const owner = await eventContract.owner();
      if (owner.toLowerCase() !== address.toLowerCase()) {
        toast.error('Only the event creator can withdraw funds');
        return;
      }

      const balanceBefore = await provider.getBalance(event.id);
      const tx = await eventContract.withdrawFunds();
      const toastId = toast.loading('Withdrawing funds...');
      
      await tx.wait();
      const balanceAfter = await provider.getBalance(event.id);

      toast.dismiss(toastId);
      
      if (balanceAfter < balanceBefore) {
        const withdrawn = formatEther(balanceBefore - balanceAfter);
        toast.success(`Successfully withdrawn ${withdrawn} ETH`);
        await fetchContractBalance();
        await onWithdraw();
      } else {
        toast.error('Withdrawal failed - contract balance unchanged');
      }
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      if (error.message.includes('No funds to withdraw')) {
        toast.error('No funds available to withdraw');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction was rejected');
      } else {
        toast.error(error.message || 'Failed to withdraw funds');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const isEventPassed = new Date() > event.date;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{event.name}</h3>
              {isCanceled && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Canceled
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {event.ticketsSold} / {event.totalTickets} tickets sold
            </p>
          </div>
          
          <div className="w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
            <div className="space-y-1">
              <p className="text-sm text-gray-600">
                Total Sales: {Number(event.price) * event.ticketsSold} ETH
              </p>
              <p className="text-sm text-gray-600">
                Available to Withdraw: {isLoadingBalance ? 'Loading...' : `${contractBalance} ETH`}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {!isCanceled && !isEventPassed && (
                <button
                  onClick={handleCancel}
                  disabled={isCanceling}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {isCanceling ? 'Canceling...' : 'Cancel Event'}
                </button>
              )}
              
              {!isCanceled && isEventPassed && (
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || Number(contractBalance) <= 0}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  <Coins className="h-4 w-4 mr-2" />
                  {isWithdrawing ? 'Withdrawing...' : 'Withdraw Funds'}
                </button>
              )}

              {!isCanceled && (
                <button
                  onClick={() => setShowVerification(!showVerification)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {showVerification ? 'Hide Scanner' : 'Verify Tickets'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showVerification && !isCanceled && (
        <TicketVerification eventId={event.id} />
      )}
    </div>
  );
}