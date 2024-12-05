import React from "react";
import { Toaster } from "react-hot-toast";
import { Web3Provider } from "./context/Web3Context";
import config from "./config.json";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import CreateEvent from "./components/CreateEvent";
import EventDetails from "./components/EventDetails";
import TicketTransfer from "./components/TicketTransfer";
// import PongGame from "./components/PongGame";

function App() {
  // Get the EventTicket address from config (assuming you're using hardhat's local network - 31337)
  const eventTicketAddress = config["31337"].EventTicket.address;

  return (
    <Web3Provider>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <Navbar />
        {/* <PongGame /> */}
        <Hero />
        <Features />
        <CreateEvent />
        <EventDetails eventAddress={eventTicketAddress} />
        <TicketTransfer />
      </div>
    </Web3Provider>
  );
}

export default App;
