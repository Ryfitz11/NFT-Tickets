import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAppSelector } from '../../redux/hooks';
import { Web3Service } from '../../services/web3';
import { Contract } from 'ethers';
import { CONTRACT_ADDRESSES } from '../../config/contracts';

interface BuyTicketButtonProps {
  eventAddress: string;
  ticketPrice: number;
  disabled?: boolean;
}

const BuyTicketButton: React.FC<BuyTicketButtonProps> = ({ eventAddress, ticketPrice, disabled }) => {
  const darkMode = useAppSelector((state) => state.theme.darkMode);
  const [isApproving, setIsApproving] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuyTicket = async () => {
    try {
      setError(null);
      
      // Step 1: Approve USDC spending
      setIsApproving(true);
      const usdcContract = new Contract(
        CONTRACT_ADDRESSES.mockUSDC,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        await Web3Service.getSigner()
      );

      const approveTx = await usdcContract.approve(eventAddress, ticketPrice);
      await approveTx.wait();
      setIsApproving(false);

      // Step 2: Buy ticket
      setIsPurchasing(true);
      const eventContract = Web3Service.getEventContract(eventAddress);
      const purchaseTx = await eventContract.buyTicket();
      await purchaseTx.wait();

      // Success! Refresh the page to show the new ticket
      window.location.reload();
    } catch (error: any) {
      console.error('Error buying ticket:', error);
      setError(error.message || 'Failed to purchase ticket');
    } finally {
      setIsApproving(false);
      setIsPurchasing(false);
    }
  };

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || isApproving || isPurchasing}
        onClick={handleBuyTicket}
        className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-medium font-['Fira_Code'] transition-colors duration-300 ${
          darkMode 
            ? 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-700' 
            : 'bg-[#0288D1] text-white hover:bg-[#0277BD] disabled:bg-gray-300'
        }`}
      >
        {isApproving ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Approving USDC...
          </>
        ) : isPurchasing ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Purchasing Ticket...
          </>
        ) : (
          'Buy Ticket'
        )}
      </motion.button>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-red-500 text-center font-['Fira_Code']"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default BuyTicketButton;