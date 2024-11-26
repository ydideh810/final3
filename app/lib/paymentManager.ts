'use client';

import { encode } from 'gpt-tokenizer';
import type { WebLNProvider, PaymentResult } from './types';

export interface PaymentPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
}

export interface TokenUsage {
  input: number;
  output: number;
}

class PaymentManager {
  private credits: number = 0;
  private readonly STORAGE_KEY = 'nidam_credits';
  private readonly MAX_CONTEXT_TOKENS = 1024;
  private readonly INPUT_TOKEN_COST = 1;
  private readonly OUTPUT_TOKEN_COST = 2;
  private isClient = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.loadCredits();
    }
  }

  public async makePayment(amount: number, memo: string): Promise<PaymentResult> {
    if (!amount || amount <= 0) {
      return {
        success: false,
        error: 'Invalid payment amount'
      };
    }

    if (!this.isClient) {
      return {
        success: false,
        error: 'Payment can only be processed in browser'
      };
    }

    try {
      if (!window.webln) {
        throw new Error('Wallet not connected');
      }

      const provider = window.webln;
      await provider.enable();

      const info = await provider.getInfo();
      if (!info?.node?.pubkey) {
        throw new Error('Failed to verify wallet connection');
      }

      const invoice = await provider.makeInvoice({
        amount,
        defaultMemo: memo || 'N.I.D.A.M Access Payment',
        payerData: {
          name: 'N.I.D.A.M',
          identifier: `nidam-${Date.now()}`
        }
      });

      if (!invoice?.paymentRequest) {
        throw new Error('Failed to generate invoice');
      }

      const result = await provider.sendPayment(invoice.paymentRequest);
      
      if (!result?.preimage) {
        throw new Error('Payment verification failed');
      }

      this.credits += amount;
      this.saveCredits();
      
      return {
        success: true,
        preimage: result.preimage
      };

    } catch (error) {
      console.error('Payment error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('rejected')) {
          return { 
            success: false, 
            error: 'Payment was rejected - please try again' 
          };
        }
        if (error.message.includes('insufficient')) {
          return { 
            success: false, 
            error: 'Insufficient funds in wallet' 
          };
        }
        if (error.message.includes('not connected')) {
          return { 
            success: false, 
            error: 'Please connect your wallet first' 
          };
        }
        return { 
          success: false, 
          error: error.message 
        };
      }

      return { 
        success: false, 
        error: 'Payment failed - please try again' 
      };
    }
  }

  private loadCredits(): void {
    if (this.isClient) {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.credits = parseInt(saved, 10);
      }
    }
  }

  private saveCredits(): void {
    if (this.isClient) {
      localStorage.setItem(this.STORAGE_KEY, this.credits.toString());
    }
  }

  public getCredits(): number {
    return this.credits;
  }

  public hasCredits(): boolean {
    return this.credits > 0;
  }

  public getMaxContextTokens(): number {
    return this.MAX_CONTEXT_TOKENS;
  }

  public getCreditId(): string {
    return `NIDAM-${Date.now().toString(36).toUpperCase()}`;
  }

  public async retrieveCreditsByMemo(memo: string): Promise<boolean> {
    return true;
  }
}

export const paymentManager = new PaymentManager();