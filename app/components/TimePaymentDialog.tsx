'use client';

import { useState, useEffect } from 'react';
import { Timer, X, CreditCard, Key, UserCircle2, Clock } from 'lucide-react';
import { guestTrialManager } from '../lib/guestTrialManager';
import { dbOperations } from '../lib/db';

interface TimePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (duration: number) => void;
}

const TIME_PACKAGES = [
  { duration: 3, price: 573, priceUSD: 0.25, label: '3 min', productId: '2wOUu' },
  { duration: 5, price: 873, priceUSD: 0.35, label: '5 min', productId: 'cThEx' },
  { duration: 10, price: 1573, priceUSD: 0.60, label: '10 min', productId: 'CAtN2' },
  { duration: 30, price: 3573, priceUSD: 1.25, label: '30 min', productId: 'Dm7O3' }
];

export function TimePaymentDialog({ 
  isOpen, 
  onClose, 
  onPurchaseSuccess
}: TimePaymentDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState(TIME_PACKAGES[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [productKey, setProductKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [trialInfo, setTrialInfo] = useState(guestTrialManager.getTrialInfo());

  useEffect(() => {
    if (isOpen) {
      setTrialInfo(guestTrialManager.getTrialInfo());
    }
  }, [isOpen]);

  const handleCardPayment = () => {
    window.open(`https://payhip.com/b/${selectedPackage.productId}`, '_blank');
    setShowKeyInput(true);
  };

  const verifyKeys = async () => {
    if (!licenseKey || !productKey) {
      setError('Please enter both license key and product key');
      return;
    }

    const isValidLicenseFormat = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(licenseKey);
    
    if (!isValidLicenseFormat) {
      setError('License key format: XXXXX-XXXXX-XXXXX-XXXXX');
      return;
    }

    // Case-sensitive check for product key
    if (!TIME_PACKAGES.some(pkg => pkg.productId === productKey)) {
      setError('Invalid product key');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const isUsed = await dbOperations.isLicenseUsed(licenseKey);
      if (isUsed) {
        setError('This license key has already been used');
        return;
      }

      // Case-sensitive comparison for product key
      if (productKey !== selectedPackage.productId) {
        setError('Product key does not match selected package');
        return;
      }

      await dbOperations.saveLicense({
        licenseKey,
        productId: selectedPackage.productId,
        timestamp: Date.now()
      });

      onPurchaseSuccess(selectedPackage.duration * 60);
      onClose();
    } catch (err) {
      console.error('Key verification error:', err);
      setError('Failed to verify keys. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGuestAccess = () => {
    if (!trialInfo.isAvailable) {
      setError(`Trial not available. Please wait ${guestTrialManager.formatCooldown(trialInfo.remainingCooldown)}`);
      return;
    }

    const duration = guestTrialManager.startTrial();
    onPurchaseSuccess(duration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-[400px] border border-[#ff0000] bg-black p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#ff0000] text-lg font-mono flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Purchase Access Time
          </h2>
          <button 
            onClick={onClose}
            className="text-[#ff0000] hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {!showKeyInput ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {TIME_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.duration}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setError(null);
                    }}
                    className={`p-4 border border-[#ff0000] font-mono text-sm ${
                      selectedPackage.duration === pkg.duration 
                        ? 'bg-[#ff0000] text-black' 
                        : 'text-[#ff0000]'
                    }`}
                  >
                    <div className="text-lg mb-1">{pkg.label}</div>
                    <div>${pkg.priceUSD.toFixed(2)}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCardPayment}
                  className="w-full py-3 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
                >
                  <CreditCard size={16} />
                  Pay with Card
                </button>

                <button
                  onClick={handleGuestAccess}
                  disabled={!trialInfo.isAvailable}
                  className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {trialInfo.isAvailable ? (
                    <>
                      <UserCircle2 size={16} />
                      Continue as Guest (10 min trial)
                    </>
                  ) : (
                    <>
                      <Clock size={16} />
                      Trial available in {guestTrialManager.formatCooldown(trialInfo.remainingCooldown)}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#ff0000] font-mono">
                <Key size={16} />
                Enter Keys
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    const formatted = value
                      .replace(/[^A-Z0-9]/g, '')
                      .match(/.{1,5}/g)?.join('-') || value;
                    setLicenseKey(formatted.slice(0, 23));
                  }}
                  placeholder="License Key: XXXXX-XXXXX-XXXXX-XXXXX"
                  className="w-full bg-black border border-[#ff0000] p-2 text-[#ff0000] font-mono placeholder-[#ff0000]/50"
                />

                <input
                  type="text"
                  value={productKey}
                  onChange={(e) => setProductKey(e.target.value)}
                  placeholder="Product Key (e.g., 2wOUu)"
                  className="w-full bg-black border border-[#ff0000] p-2 text-[#ff0000] font-mono placeholder-[#ff0000]/50"
                />
              </div>

              <button
                onClick={verifyKeys}
                disabled={isProcessing}
                className="w-full py-3 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 disabled:opacity-50"
              >
                {isProcessing ? 'Verifying...' : 'Verify Keys'}
              </button>

              <button
                onClick={() => {
                  setShowKeyInput(false);
                  setLicenseKey('');
                  setProductKey('');
                  setError(null);
                }}
                className="w-full py-2 text-[#ff0000]/70 font-mono hover:text-[#ff0000]"
              >
                Back to Payment Options
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-[#ff0000] font-mono text-sm">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}