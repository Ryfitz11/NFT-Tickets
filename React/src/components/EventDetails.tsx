import React from "react";
import { useState, useEffect } from "react";
import { useWeb3 } from "../../contract/context/Web3Context";
import { ethers } from "ethers";
import { Calendar, Users, Ticket } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EventDetails() {
  const { contract, isConnected } = useWeb3();
  const [eventDetails, setEventDetails] = useState({
    name: "Summer Music Festival 2024",
    date: new Date("2024-07-15"),
    totalTickets: 1000,
    ticketsSold: 450,
    ticketPrice: "0.1",
  });

  useEffect(() => {
    if (contract) {
      fetchEventDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

  useEffect(() => {
    console.log("Web3 Context State:eventDetails", {
      isConnected,
      hasContract: !!contract,
      contractAddress: contract?.address,
    });
  }, [contract, isConnected]);

  const fetchEventDetails = async () => {
    try {
      const [name, date, totalTickets, ticketsSold] =
        await contract!.getEventDetails();
      const price = await contract!.ticketPrice();

      setEventDetails({
        name,
        date: new Date(Number(date) * 1000),
        totalTickets: Number(totalTickets),
        ticketsSold: Number(ticketsSold),
        ticketPrice: ethers.formatEther(price),
      });
    } catch (error) {
      console.error("Error fetching event details:", error);
    }
  };

  const buyTicket = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contract) {
      toast.error("Contract not initialized");
      return;
    }

    try {
      const tx = await contract.buyTicket({
        value: ethers.parseEther(eventDetails.ticketPrice),
      });
      const loadingToast = toast.loading("Purchasing ticket...");
      await tx.wait();
      toast.dismiss(loadingToast);
      toast.success("Ticket purchased successfully!");
      fetchEventDetails();
    } catch (error: Error | unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to purchase ticket";
      toast.error(errorMessage);
      console.error("Buy ticket error:", error);
    }
  };

  const stats = [
    {
      icon: <Calendar className="h-6 w-6 text-purple-600" />,
      label: "Date",
      value: eventDetails.date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      label: "Availability",
      value: `${eventDetails.ticketsSold} / ${eventDetails.totalTickets}`,
    },
    {
      icon: <Ticket className="h-6 w-6 text-purple-600" />,
      label: "Price",
      value: `${eventDetails.ticketPrice} ETH`,
    },
  ];

  return (
    <div className="py-24" id="event-details">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">
            Event Details
          </h2>
          <p className="mt-2 text-4xl font-bold text-gray-900">
            {eventDetails.name}
          </p>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-purple-100">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <button onClick={buyTicket} className="btn-primary w-full">
                Buy Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
