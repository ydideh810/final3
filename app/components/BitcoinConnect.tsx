'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import type { WebLNProvider } from '../lib/types';

// Dynamically import Bitcoin Connect Button with no SSR
const BitcoinConnectButton = dynamic(
  () => import('@getalby/bitcoin-connect-react').then(mod => mod.Button),
  { ssr: false }
);

interface BitcoinConnectProps {
  onConnect: () => void;
}

export function BitcoinConnect({ onConnect }: BitcoinConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeWebLN = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && window.webln) {
        await window.webln.enable();
        const info = await window.webln.getInfo();
        if (info?.node?.pubkey) {
          setIsConnected(true);
          onConnect();
        }
      }
    } catch (err) {
      console.warn('WebLN initialization failed:', err);
      setError('Failed to initialize wallet');
    }
  }, [onConnect]);

  useEffect(() => {
    initializeWebLN();
  }, [initializeWebLN]);

  const handleLaunchModal = useCallback(async () => {
    try {
      setError(null);
      const { launchModal } = await import('@getalby/bitcoin-connect-react');
      await launchModal();
      await initializeWebLN();
    } catch (err) {
      console.error('Connection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  }, [initializeWebLN]);

  if (isConnected) {
    return (
      <div className="text-[#ff0000] flex items-center gap-2">
        <Wallet size={16} />
        Connected
        <div className="text-[#ff0000]/70 text-xs ml-2">
          573 sats per command
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 flex items-center justify-center gap-2">
        <BitcoinConnectButton />
      </div>
      <button
        onClick={handleLaunchModal}
        className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
      >
        <Wallet size={16} />
        Connect Wallet
      </button>
      {error && (
        <div className="text-[#ff0000] text-xs mt-2">
          {error}
        </div>
      )}
    </div>
  );
}