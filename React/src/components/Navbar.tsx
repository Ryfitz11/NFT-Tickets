import React from "react";
import { Menu, X, Ticket } from "lucide-react";
import { useWeb3 } from "../../contract/context/Web3Context";

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { connectWallet, account } = useWeb3();

  const navItems = [
    { name: "Events", href: "#events" },
    { name: "Marketplace", href: "#marketplace" },
    { name: "How it Works", href: "#how-it-works" },
  ];

  return (
    <nav className="fixed w-full z-50">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                NFTix
              </span>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center gap-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
                <button onClick={connectWallet} className="btn-primary">
                  {account
                    ? `${account.slice(0, 6)}...${account.slice(-4)}`
                    : "Connect Wallet"}
                </button>
              </div>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-t border-gray-100">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-purple-600 transition-colors"
                >
                  {item.name}
                </a>
              ))}
              <button
                onClick={connectWallet}
                className="w-full btn-primary mt-4"
              >
                {account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : "Connect Wallet"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
