import { Web3Provider } from "@ethersproject/providers";
import { Web3Context } from "../context/Web3Context";

import React, { createContext, ReactNode, useContext } from "react";

interface Web3ContextType {
  provider: Web3Provider | null;
}

const Web3Context = createContext<Web3ContextType>({ provider: null });

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}

interface Web3ProviderProps {
  children: ReactNode;
  provider: Web3Provider;
}

export function Web3ContextProvider({ children, provider }: Web3ProviderProps) {
  return (
    <Web3Context.Provider value={{ provider }}>{children}</Web3Context.Provider>
  );
}

export { Web3Context };
