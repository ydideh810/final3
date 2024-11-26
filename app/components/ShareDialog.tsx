'use client';

import { useState } from 'react';
import { X, Share2, Copy, Check } from 'lucide-react';
import { Message } from '../lib/types';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
}

export function ShareDialog({ isOpen, onClose, messages }: ShareDialogProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyConversation = async () => {
    try {
      const conversationText = messages
        .map(msg => `${msg.sender === 'user' ? 'You' : 'N.I.D.A.M'}: ${msg.text}`)
        .join('\n\n');
      
      await navigator.clipboard.writeText(conversationText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy conversation:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-[600px] border border-[#ff0000] bg-black p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#ff0000] text-lg font-mono flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Conversation
          </h2>
          <button 
            onClick={onClose}
            className="text-[#ff0000] hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border border-[#ff0000] p-4 mb-4 h-[300px] overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="mb-4">
              <div className="text-[#ff0000]/70 text-sm mb-1">
                {msg.sender === 'user' ? 'You' : 'N.I.D.A.M'}:
              </div>
              <div className="text-[#ff0000]">{msg.text}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopyConversation}
          className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
        >
          {isCopied ? (
            <>
              <Check size={16} />
              Copied to Clipboard
            </>
          ) : (
            <>
              <Copy size={16} />
              Copy Conversation
            </>
          )}
        </button>
      </div>
    </div>
  );
}