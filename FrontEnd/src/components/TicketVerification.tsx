import React, { useState } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { toast } from 'react-hot-toast';
import { Scan as QrScanner, Check, X } from 'lucide-react';

interface TicketVerificationProps {
  eventId: string;
}

const TICKET_ABI = [
  "function isTicketOwner(address user, uint256 ticketId) view returns (bool)",
  "function getTicketStatus(uint256 ticketId) view returns (bool)",
  "function markTicketAsUsed(uint256 ticketId)",
];

export function TicketVerification({ eventId }: TicketVerificationProps) {
  const { provider, address } = useWallet();
  const [ticketId, setTicketId] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    isValid?: boolean;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyTicket = async () => {
    if (!provider || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!ticketId) {
      toast.error('Please enter a ticket ID');
      return;
    }

    setIsVerifying(true);
    try {
      const signer = await provider.getSigner();
      const contract = new Contract(eventId, TICKET_ABI, signer);

      // Check if ticket has been used
      const isUsed = await contract.getTicketStatus(ticketId);
      if (isUsed) {
        setVerificationResult({
          isValid: false,
          message: 'This ticket has already been used'
        });
        return;
      }

      // Mark ticket as used
      const tx = await contract.markTicketAsUsed(ticketId);
      await tx.wait();

      setVerificationResult({
        isValid: true,
        message: 'Ticket verified and marked as used'
      });
      toast.success('Ticket verified successfully');
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationResult({
        isValid: false,
        message: error.message || 'Failed to verify ticket'
      });
      toast.error(error.message || 'Failed to verify ticket');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Verify Tickets</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700">
            Ticket ID
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              id="ticketId"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter ticket ID"
            />
            <button
              onClick={verifyTicket}
              disabled={isVerifying || !ticketId}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              <QrScanner className="h-4 w-4 mr-2" />
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>

        {verificationResult && (
          <div className={`p-4 rounded-md ${verificationResult.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {verificationResult.isValid ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                  {verificationResult.message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}