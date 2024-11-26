'use client';

import { DataConnection, Peer } from 'peerjs';
import { Message } from './types';

export interface EncryptedConversation {
  id: string;
  encryptedData: string;
  iv: string;
  salt: string;
}

class P2PManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();

  async initialize(): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer();
        
        this.peer.on('open', (id) => {
          console.log('P2P connection established with ID:', id);
          resolve(id);
        });

        this.peer.on('connection', (conn) => {
          this.handleConnection(conn);
        });

        this.peer.on('error', (error) => {
          console.error('P2P connection error:', error);
          reject(error);
        });
      } catch (error) {
        console.error('Failed to initialize P2P connection:', error);
        reject(error);
      }
    });
  }

  private handleConnection(conn: DataConnection) {
    this.connections.set(conn.peer, conn);

    conn.on('data', async (data: any) => {
      if (data.type === 'conversation') {
        try {
          // Handle received conversation
          console.log('Received encrypted conversation:', data.conversation);
          // The receiver would need to decrypt this with their own key
        } catch (error) {
          console.error('Error handling received conversation:', error);
        }
      }
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  async connectToPeer(peerId: string): Promise<void> {
    if (!this.peer) throw new Error('P2P not initialized');

    return new Promise((resolve, reject) => {
      const conn = this.peer!.connect(peerId);
      
      conn.on('open', () => {
        this.connections.set(peerId, conn);
        resolve();
      });

      conn.on('error', (error) => {
        reject(error);
      });
    });
  }

  async sendConversation(peerId: string, encryptedConversation: EncryptedConversation): Promise<void> {
    const conn = this.connections.get(peerId);
    if (!conn) throw new Error('No connection to peer');

    conn.send({
      type: 'conversation',
      conversation: encryptedConversation
    });
  }

  async encryptConversation(messages: Message[], password: string): Promise<EncryptedConversation> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Encrypt the conversation
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encoder.encode(JSON.stringify(messages))
    );

    return {
      id: crypto.randomUUID(),
      encryptedData: Buffer.from(encryptedData).toString('base64'),
      iv: Buffer.from(iv).toString('base64'),
      salt: Buffer.from(salt).toString('base64')
    };
  }

  async decryptConversation(
    encryptedConversation: EncryptedConversation,
    password: string
  ): Promise<Message[]> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const salt = Buffer.from(encryptedConversation.salt, 'base64');
    const iv = Buffer.from(encryptedConversation.iv, 'base64');
    const encryptedData = Buffer.from(encryptedConversation.encryptedData, 'base64');

    // Derive key from password
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt the conversation
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedData
    );

    return JSON.parse(decoder.decode(decryptedData));
  }

  disconnect() {
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    this.peer?.disconnect();
    this.peer = null;
  }
}

export const p2pManager = new P2PManager();