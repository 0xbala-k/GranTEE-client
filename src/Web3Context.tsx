import React, { createContext, useContext, useEffect, useState } from 'react';
import { connectWallet, disconnectWallet, setupAccountChangeListener, getCurrentAccount } from './services/helper.ts';
import { toast } from 'react-toastify';

// Key for storing wallet connection state in localStorage
const WALLET_CONNECTED_KEY = 'grantee_wallet_connected';

interface IWeb3Context {
    account: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    isConnecting: boolean;
}

const Web3Context = createContext<IWeb3Context>({
    account: null,
    connect: async () => {},
    disconnect: async () => {},
    isConnecting: false,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  
  // Check for existing connection on mount
  useEffect(() => {
    const checkExistingConnection = async () => {
      const wasConnected = localStorage.getItem(WALLET_CONNECTED_KEY) === 'true';
      
      if (wasConnected) {
        setIsConnecting(true);
        try {
          // Try to get the current account
          const currentAccount = await getCurrentAccount();
          
          if (currentAccount) {
            setAccount(currentAccount);
            toast.success(`Wallet reconnected: ${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`);
          } else {
            // Clear the localStorage flag if we couldn't reconnect
            localStorage.removeItem(WALLET_CONNECTED_KEY);
          }
        } catch (error) {
          console.error("Error reconnecting wallet:", error);
          localStorage.removeItem(WALLET_CONNECTED_KEY);
        } finally {
          setIsConnecting(false);
        }
      }
    };
    
    checkExistingConnection();
  }, []);

  // Wallet Connection Handlers
  const connect = async () => {
    setIsConnecting(true);
    try {
      const account = await connectWallet();
      setAccount(account);
      // Save connection state to localStorage
      localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
      toast.success(`Wallet connected: ${account.slice(0, 6)}...${account.slice(-4)}`);
    } catch (error) {
      console.log("Error: ", error);
      toast.error(`Failed to connect wallet: ${error instanceof Error ? error.message : String(error)}`);
      localStorage.removeItem(WALLET_CONNECTED_KEY);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
        await disconnectWallet();
        setAccount(null);
        // Remove connection state from localStorage
        localStorage.removeItem(WALLET_CONNECTED_KEY);
        toast.info('Wallet disconnected');
    } catch (error) {
        console.log("Error: ", error);
        toast.error(`Failed to disconnect wallet: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  useEffect(() => {
    if (!account) return;
    const cleanup = setupAccountChangeListener((accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        // Account changed but still connected
        localStorage.setItem(WALLET_CONNECTED_KEY, 'true');
        toast.info(`Wallet changed to: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      } else {
        // No accounts, means disconnected
        disconnect();
      }
    });
    return cleanup;
  }, [account]);

  return (
    <Web3Context.Provider value={{ account, connect, disconnect, isConnecting }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);