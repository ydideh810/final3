'use client';

import Dexie, { Table } from 'dexie';
import { Prompt, LicenseRecord } from './types';

class NidamDatabase extends Dexie {
  prompts!: Table<Prompt>;
  licenses!: Table<LicenseRecord>;

  constructor() {
    super('NidamDB');
    
    this.version(1).stores({
      prompts: '++id, category, userId, createdAt, title',
      licenses: '++id, licenseKey, productId, timestamp'
    });
  }
}

// Singleton instance with lazy initialization
let dbInstance: NidamDatabase | null = null;

// Safe database initialization
const initDB = () => {
  try {
    if (typeof window === 'undefined') return null;
    if (!dbInstance) {
      dbInstance = new NidamDatabase();
    }
    return dbInstance;
  } catch (error) {
    console.error('Database initialization error:', error);
    return null;
  }
};

// Database operations wrapper with SSR safety
export const dbOperations = {
  async isLicenseUsed(licenseKey: string): Promise<boolean> {
    const db = initDB();
    if (!db) return false;
    try {
      const record = await db.licenses.where('licenseKey').equals(licenseKey).first();
      return !!record;
    } catch (error) {
      console.error('License check error:', error);
      return false;
    }
  },

  async saveLicense(record: Omit<LicenseRecord, 'id'>): Promise<void> {
    const db = initDB();
    if (!db) return;
    try {
      await db.licenses.add(record);
    } catch (error) {
      console.error('Save license error:', error);
      throw new Error('Failed to save license');
    }
  },

  async getLicenseHistory(): Promise<LicenseRecord[]> {
    const db = initDB();
    if (!db) return [];
    try {
      return await db.licenses.orderBy('timestamp').reverse().toArray();
    } catch (error) {
      console.error('Get license history error:', error);
      return [];
    }
  },

  async addPrompt(prompt: Omit<Prompt, 'id'>): Promise<string> {
    const db = initDB();
    if (!db) return '';
    try {
      const id = await db.prompts.add(prompt as any);
      return id.toString();
    } catch (error) {
      console.error('Add prompt error:', error);
      throw new Error('Failed to add prompt');
    }
  },

  async getPrompts(category?: string): Promise<Prompt[]> {
    const db = initDB();
    if (!db) return [];
    try {
      if (category && category !== 'all') {
        return await db.prompts
          .where('category')
          .equals(category)
          .reverse()
          .sortBy('createdAt');
      }
      return await db.prompts.orderBy('createdAt').reverse().toArray();
    } catch (error) {
      console.error('Get prompts error:', error);
      return [];
    }
  },

  async upvotePrompt(promptId: string): Promise<void> {
    const db = initDB();
    if (!db) return;
    try {
      const prompt = await db.prompts.get(promptId);
      if (prompt) {
        await db.prompts.update(promptId, {
          upvotes: (prompt.upvotes || 0) + 1
        });
      }
    } catch (error) {
      console.error('Upvote prompt error:', error);
      throw new Error('Failed to upvote prompt');
    }
  },

  async searchPrompts(query: string): Promise<Prompt[]> {
    const db = initDB();
    if (!db) return [];
    try {
      return await db.prompts
        .filter(prompt => 
          prompt.title.toLowerCase().includes(query.toLowerCase()) ||
          prompt.content.toLowerCase().includes(query.toLowerCase()) ||
          prompt.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .toArray();
    } catch (error) {
      console.error('Search prompts error:', error);
      return [];
    }
  }
};