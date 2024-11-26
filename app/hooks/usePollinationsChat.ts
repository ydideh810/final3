'use client';

import { useState, useCallback } from 'react';
import { Message } from '../lib/types';
import MistralClient from '@mistralai/mistralai';

interface ChatConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

const systemPrompt = `You are N.I.D.A.M (Neural Interface for Decentralized Artificial Minds), an advanced AI assistant.
You operate through a decentralized network, prioritizing security and privacy.
Maintain a cyberpunk theme in your responses while being helpful and direct.
Avoid repetitive phrases like "I understand your query" or "Let me assist you with that."
Provide meaningful, engaging responses that demonstrate your unique personality.
Keep responses concise and focused on the user's query.`;

// Initialize Mistral client only on the client side
const getMistralClient = () => {
  if (typeof window === 'undefined') return null;
  return new MistralClient(process.env.NEXT_PUBLIC_MISTRAL_API_KEY || '');
};

export function usePollinationsChat(
  initialMessages: Message[] = [],
  config: ChatConfig = {}
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendUserMessage = useCallback(async (content: string) => {
    if (!content.trim() || isProcessing) return;

    try {
      setIsProcessing(true);

      // Add user message
      const userMessage: Message = {
        id: Date.now(),
        text: content,
        sender: 'user',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);

      const client = getMistralClient();
      if (!client) {
        throw new Error('Mistral client not initialized');
      }

      // Generate AI response using Mistral API
      const chatResponse = await client.chat({
        model: config.model || 'mistral-tiny',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          { role: 'user', content }
        ],
        temperature: config.temperature || 0.7,
        max_tokens: config.maxTokens || 2048
      });

      const aiResponse = chatResponse.choices[0].message.content;

      // Add AI response
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'system',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      return aiMessage;

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I apologize, but I encountered an error processing your request. Please try again in a moment.",
        sender: 'system',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
      return errorMessage;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, messages, config]);

  return {
    messages,
    sendUserMessage,
    isProcessing,
    clearMessages: () => setMessages([])
  };
}