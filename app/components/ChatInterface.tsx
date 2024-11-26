'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Book, Share2, HelpCircle, Trophy } from 'lucide-react';
import { RadarDisplay } from './RadarDisplay';
import { Message } from '../lib/types';
import { TimePaymentDialog } from './TimePaymentDialog';
import { Tutorial } from './Tutorial';
import { PromptLibrary } from './PromptLibrary';
import { ShareDialog } from './ShareDialog';
import { AchievementsDashboard } from './AchievementsDashboard';
import { AchievementNotification } from './AchievementNotification';
import { usePollinationsChat } from '../hooks/usePollinationsChat';
import ReactMarkdown from 'react-markdown';

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Initialize chat hook
  const {
    messages,
    sendUserMessage,
    isProcessing,
    clearMessages
  } = usePollinationsChat([], {
    model: 'mistral-tiny',
    temperature: 0.7,
    maxTokens: 2048
  });

  useEffect(() => {
    if (timeRemaining === null) {
      setShowPaymentDialog(true);
    }
  }, []);

  useEffect(() => {
    if (timeRemaining !== null) {
      if (timeRemaining > 0) {
        timerRef.current = setInterval(() => {
          setTimeRemaining(prev => {
            if (prev === null || prev <= 0) return 0;
            return prev - 1;
          });
        }, 1000);
        setIsLocked(false);
      } else {
        setIsLocked(true);
        setShowPaymentDialog(true);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePurchaseSuccess = (duration: number) => {
    setTimeRemaining(duration);
    setIsLocked(false);
    setShowPaymentDialog(false);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || isLocked) return;

    setError(null);
    const currentInput = input;
    setInput('');

    try {
      await sendUserMessage(currentInput);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process message');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <AchievementNotification />
      
      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col">
          {isLocked ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-[#ff0000] text-center">
                <div className="text-2xl mb-4">ACCESS LOCKED</div>
                <div className="mb-4">Purchase time to continue using N.I.D.A.M</div>
                <button
                  onClick={() => setShowPaymentDialog(true)}
                  className="px-6 py-2 border border-[#ff0000] hover:bg-[#ff0000]/10"
                >
                  Purchase Access
                </button>
              </div>
            </div>
          ) : (
            <>
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 p-4 scrollbar-thin scrollbar-thumb-[#ff0000] scrollbar-track-transparent"
              >
                {messages.map((msg, index) => (
                  <div
                    key={msg.id}
                    ref={index === messages.length - 1 ? lastMessageRef : null}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-2 border border-[#ff0000] ${
                      msg.sender === 'user' ? 'bg-[#ff0000]/10' : 'bg-transparent'
                    }`}>
                      <div className="text-xs text-[#ff0000]/70 mb-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-[#ff0000] whitespace-pre-wrap">
                        <ReactMarkdown className="prose prose-invert max-w-none">
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#ff0000] p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter message..."
                    className="flex-1 bg-transparent border border-[#ff0000] p-2 text-[#ff0000] placeholder-[#ff0000]/50"
                    disabled={isProcessing}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="px-4 py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>

                {error && (
                  <div className="mt-2 text-[#ff0000] text-sm">{error}</div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="w-64 border-l border-[#ff0000] p-4 flex flex-col">
          <RadarDisplay />
          <div className="mt-4 text-center border border-[#ff0000] p-2">
            <div className="text-[#ff0000] text-sm mb-1">SYSTEM STATUS</div>
            {timeRemaining !== null && (
              <div className="text-[#ff0000] mb-2">
                Time Remaining: {formatTime(timeRemaining)}
              </div>
            )}
            <div className="space-y-2">
              <button
                onClick={() => setShowPromptLibrary(true)}
                className="w-full py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
              >
                <Book size={16} />
                Prompt Library
              </button>
              <button
                onClick={() => setShowShareDialog(true)}
                className="w-full py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
              >
                <Share2 size={16} />
                Share Chat
              </button>
              <button
                onClick={() => setShowAchievements(true)}
                className="w-full py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
              >
                <Trophy size={16} />
                Achievements
              </button>
              <button
                onClick={() => setShowTutorial(true)}
                className="w-full py-2 border border-[#ff0000] text-[#ff0000] hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
              >
                <HelpCircle size={16} />
                Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>

      <TimePaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onPurchaseSuccess={handlePurchaseSuccess}
      />

      <PromptLibrary
        isOpen={showPromptLibrary}
        onClose={() => setShowPromptLibrary(false)}
        onSelectPrompt={(content) => setInput(content)}
      />

      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        messages={messages}
      />

      <AchievementsDashboard
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      <Tutorial 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}