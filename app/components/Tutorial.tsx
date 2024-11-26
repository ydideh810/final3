'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Tutorial({ isOpen, onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'Welcome to N.I.D.A.M',
      content: 'N.I.D.A.M is your Neural Interface for Decentralized Artificial Minds. This tutorial will guide you through all features.',
      image: '🤖'
    },
    {
      title: 'Access Options',
      content: 'Purchase access time using Bitcoin Lightning or card payment. You can also try a 3-minute guest trial to explore the interface.',
      image: '⚡'
    },
    {
      title: 'Chat Interface',
      content: 'Interact with N.I.D.A.M through the main chat window. The AI adapts to your communication style and preferences over time.',
      image: '💬'
    },
    {
      title: 'Prompt Library',
      content: 'Access and contribute to a collection of pre-made prompts. Browse categories, upvote useful prompts, or add your own.',
      image: '📚'
    },
    {
      title: 'Share Conversations',
      content: 'Securely share encrypted conversations with other users through P2P connections. Your privacy is always protected.',
      image: '🔒'
    },
    {
      title: 'System Status',
      content: 'Monitor your remaining time and connection status through the radar display and status panel.',
      image: '📊'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-[600px] border border-[#ff0000] bg-black p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#ff0000] text-lg font-mono">
            Tutorial ({currentStep + 1}/{tutorialSteps.length})
          </h2>
          <button 
            onClick={onClose}
            className="text-[#ff0000] hover:opacity-80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-4">
            {tutorialSteps[currentStep].image}
          </div>
          <h3 className="text-[#ff0000] text-xl font-mono mb-4">
            {tutorialSteps[currentStep].title}
          </h3>
          <p className="text-[#ff0000]/80 font-mono">
            {tutorialSteps[currentStep].content}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {currentStep < tutorialSteps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(tutorialSteps.length - 1, prev + 1))}
              className="px-4 py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 flex items-center gap-2"
            >
              Next
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10"
            >
              Get Started
            </button>
          )}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2 h-2 rounded-full border border-[#ff0000] ${
                currentStep === index ? 'bg-[#ff0000]' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}