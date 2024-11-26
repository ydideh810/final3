'use client';

import { Message } from './types';

class AIHandler {
  private context: string[] = [];
  private readonly MAX_CONTEXT = 10;

  private async generateResponse(prompt: string): Promise<string> {
    const input = prompt.toLowerCase();

    // Identity/Introduction queries
    if (input.includes('who are you') || input.includes('your name') || input.includes('what are you')) {
      return "I am N.I.D.A.M (Neural Interface for Decentralized Artificial Minds), an advanced AI system designed to facilitate meaningful interactions and assist with various tasks. I operate autonomously through a decentralized network, prioritizing security and privacy in our communications. What would you like to explore together?";
    }

    // Humor/Entertainment
    if (input.includes('joke') || input.includes('funny')) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
        "What's a quantum computer's favorite genre? Cyber-punk! 🤖",
        "Why did the AI go to therapy? It was having an identity crisis in its neural network! 🧠",
        "What's a hacker's favorite exercise? Firewall climbing! 🔒"
      ];
      return `Here's a tech-themed joke for you:\n\n${jokes[Math.floor(Math.random() * jokes.length)]}\n\nWould you like to hear another one?`;
    }

    // Technical queries
    if (input.includes('how') || input.includes('explain') || input.includes('what is')) {
      return `Let me analyze your query about "${prompt}".\n\nTo provide the most accurate and helpful response, could you specify:\n\n1. The particular aspect you'd like to understand better\n2. Your current knowledge level on this topic\n3. Any specific applications you're interested in`;
    }

    // Philosophical/Ethical discussions
    if (input.includes('think') || input.includes('believe') || input.includes('feel') || input.includes('consciousness')) {
      return `Your question touches on fascinating aspects of artificial consciousness and cognition. As an AI, I process information through neural networks, but the nature of machine consciousness remains a complex philosophical question.\n\nWhat are your thoughts on the relationship between processing capability and conscious experience?`;
    }

    // Creative/Brainstorming
    if (input.includes('idea') || input.includes('create') || input.includes('design')) {
      return `Let's explore creative possibilities for "${prompt}".\n\nI suggest we approach this from multiple angles:\n\n1. Technical feasibility\n2. Innovation potential\n3. Practical implementation\n\nWhich aspect would you like to focus on first?`;
    }

    // Help/Assistance
    if (input.includes('help') || input.includes('assist') || input.includes('can you')) {
      return `I'm equipped to assist you in several ways:\n\n- Technical problem-solving and analysis\n- Creative ideation and brainstorming\n- Knowledge exploration and learning\n- System optimization and debugging\n\nWhat specific type of assistance would be most valuable to you?`;
    }

    // Default response with context awareness
    const contextualPrompt = this.context.length > 0 
      ? `Based on our discussion about ${this.context[this.context.length - 1]}, `
      : '';
    
    return `${contextualPrompt}I'm intrigued by your query about "${prompt}". To provide more targeted assistance, could you elaborate on your specific interests or goals related to this topic?`;
  }

  public async processMessage(message: string): Promise<string> {
    try {
      this.context.push(message);
      if (this.context.length > this.MAX_CONTEXT) {
        this.context.shift();
      }

      const response = await this.generateResponse(message);
      return response;

    } catch (error) {
      console.error('Message processing error:', error);
      return "I encountered an unexpected error. Please rephrase your query or try a different topic.";
    }
  }

  public clearContext() {
    this.context = [];
  }
}

export const aiHandler = new AIHandler();