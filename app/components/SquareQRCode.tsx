'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface SquareQRCodeProps {
  amount: number;
  duration: number;
  onSuccess: () => void;
}

export function SquareQRCode({
  amount,
  duration,
  onSuccess,
}: SquareQRCodeProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real app, you would poll your backend to check payment status
  // For demo, we'll simulate a successful payment after QR code scan
  const checkPaymentStatus = () => {
    // Simulated payment success after 5 seconds
    setTimeout(() => {
      onSuccess();
    }, 5000);
  };

  return (
    <div className="border border-[#ff0000] p-4 bg-black">
      <div className="mb-4 text-center text-[#ff0000] font-mono">
        Scan QR Code to Pay ${amount.toFixed(2)}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader className="animate-spin text-[#ff0000]" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="border border-[#ff0000] p-2 bg-white">
            <Image
              src="/3qr.png"
              alt="Square Payment QR Code"
              width={200}
              height={200}
              className="w-[200px] h-[200px]"
            />
          </div>
          <button
            onClick={checkPaymentStatus}
            className="mt-4 w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10"
          >
            I've completed the payment
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 text-[#ff0000] font-mono text-sm">{error}</div>
      )}
    </div>
  );
}
