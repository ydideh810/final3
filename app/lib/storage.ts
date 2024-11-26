'use client';

import { Message } from './types';

class LocalStorage {
  private readonly MESSAGE_KEY = 'nidam_messages';
  private readonly CONTEXT_KEY = 'nidam_context';
  private readonly CREDITS_KEY = 'nidam_credits';

  private isClient = typeof window !== 'undefined';

  public saveMessages(messages: Message[]): void {
    if (this.isClient) {
      localStorage.setItem(this.MESSAGE_KEY, JSON.stringify(messages));
    }
  }

  public getMessages(): Message[] {
    if (this.isClient) {
      const saved = localStorage.getItem(this.MESSAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  }

  public clearMessages(): void {
    if (this.isClient) {
      localStorage.removeItem(this.MESSAGE_KEY);
    }
  }

  public saveContext(context: any): void {
    if (this.isClient) {
      localStorage.setItem(this.CONTEXT_KEY, JSON.stringify(context));
    }
  }

  public getContext(): any {
    if (this.isClient) {
      const saved = localStorage.getItem(this.CONTEXT_KEY);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }

  public saveCredits(credits: number): void {
    if (this.isClient) {
      localStorage.setItem(this.CREDITS_KEY, credits.toString());
    }
  }

  public getCredits(): number {
    if (this.isClient) {
      const saved = localStorage.getItem(this.CREDITS_KEY);
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  }
}

export const storage = new LocalStorage();