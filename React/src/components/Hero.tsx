import { Wallet, Ticket, ArrowRight } from "lucide-react";
import { useWeb3 } from "../../contract/context/Web3Context";

export default function Hero() {
  const { connectWallet, account } = useWeb3();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-50"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="block text-gray-900">The Future of</span>
            <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Event Ticketing
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
            Buy, sell, and collect unique NFT tickets for your favorite events.
            Secure, transparent, and unforgettable experiences powered by
            blockchain.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={connectWallet}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Wallet className="h-5 w-5" />
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </button>

            <button className="btn-primary flex items-center justify-center gap-2 !bg-white !from-transparent !to-transparent !text-purple-600 border border-purple-200">
              <Ticket className="h-5 w-5" />
              Browse Events
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
            ].map((img, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <img
                  src={`${img}?auto=format&fit=crop&w=800&q=80`}
                  alt="Event preview"
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
