import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import config from "../config.json";
import EventTicketFactoryABI from "../contract/EventTicketFactory.json";
import EventTicketABI from "../contract/EventTicket.json";

interface EventDetailsProps {
  eventAddress: string;
}

export default function EventDetails({ eventAddress }: EventDetailsProps) {
  const [eventContract, setEventContract] = useState<ethers.Contract | null>(
    null
  );
  const [eventDetails, setEventDetails] = useState<{
    name: string;
    date: Date;
    totalTickets: number;
    ticketsSold: number;
    ticketPrice: string;
  } | null>(null);

  // Setup factory contract
  const setupContracts = useCallback(async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // Setup specific event contract using the provided address
      if (eventAddress) {
        const event = new ethers.Contract(eventAddress, EventTicketABI, signer);
        setEventContract(event);
      }
    } catch (error) {
      console.error("Error setting up contracts:", error);
    }
  }, [eventAddress]);

  const fetchEventDetails = useCallback(async () => {
    try {
      if (!eventContract) return;

      // Get event details from the contract
      const details = await eventContract.getEventDetails();
      const price = await eventContract.ticketPrice();

      setEventDetails({
        name: details[0],
        date: new Date(Number(details[1]) * 1000),
        totalTickets: Number(details[2]),
        ticketsSold: Number(details[3]),
        ticketPrice: ethers.utils.formatEther(price),
      });
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  }, [eventContract]);

  const buyTicket = async () => {
    if (!eventContract || !eventDetails) return;

    try {
      const tx = await eventContract.buyTicket({
        value: ethers.utils.parseEther(eventDetails.ticketPrice),
      });

      const loadingToast = toast.loading("Purchasing ticket...");

      try {
        await tx.wait();
        toast.dismiss(loadingToast);
        toast.success("Ticket purchased successfully!");
        await fetchEventDetails(); // Refresh event details
      } catch (error) {
        toast.dismiss(loadingToast);
        throw error;
      }
    } catch (error: any) {
      let errorMessage = "Failed to purchase ticket";

      if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient funds to purchase ticket";
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    setupContracts();
    fetchEventDetails();
  }, [eventAddress, setupContracts, fetchEventDetails, eventContract]);

  return (
    <div>
      {/* Render your event details components here */}
      <button onClick={buyTicket}>Buy Ticket</button>
    </div>
  );
}
