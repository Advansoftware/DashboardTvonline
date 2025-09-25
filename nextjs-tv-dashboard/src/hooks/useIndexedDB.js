// Hook para gerenciar dados no IndexedDB
import { useState, useEffect } from 'react';

const DB_NAME = 'TVDashboardDB';
const DB_VERSION = 1;
const STORES = {
  CHANNELS: 'channels',
  PLAYLISTS: 'playlists',
  SETTINGS: 'settings',
  HISTORY: 'history'
};

class IndexedDBManager {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Store para canais
        if (!db.objectStoreNames.contains(STORES.CHANNELS)) {
          const channelsStore = db.createObjectStore(STORES.CHANNELS, { keyPath: 'id' });
          channelsStore.createIndex('group', 'group', { unique: false });
          channelsStore.createIndex('name', 'name', { unique: false });
        }

        // Store para playlists
        if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
          const playlistsStore = db.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
          playlistsStore.createIndex('name', 'name', { unique: false });
        }

        // Store para configurações
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Store para histórico
        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('channelId', 'channelId', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async getAllFromStore(storeName) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async addToStore(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async putToStore(storeName, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteFromStore(storeName, id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async clearStore(storeName) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

const dbManager = new IndexedDBManager();

export const useIndexedDB = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    dbManager.init().then(() => setIsReady(true));
  }, []);

  return {
    isReady,
    
    // Canais
    async getChannels() {
      return await dbManager.getAllFromStore(STORES.CHANNELS);
    },
    
    async saveChannel(channel) {
      return await dbManager.putToStore(STORES.CHANNELS, channel);
    },
    
    async saveChannels(channels) {
      const promises = channels.map(channel => dbManager.putToStore(STORES.CHANNELS, channel));
      return await Promise.all(promises);
    },
    
    async deleteChannel(id) {
      return await dbManager.deleteFromStore(STORES.CHANNELS, id);
    },

    // Playlists
    async getPlaylists() {
      return await dbManager.getAllFromStore(STORES.PLAYLISTS);
    },
    
    async savePlaylist(playlist) {
      return await dbManager.putToStore(STORES.PLAYLISTS, playlist);
    },
    
    async deletePlaylist(id) {
      return await dbManager.deleteFromStore(STORES.PLAYLISTS, id);
    },

    // Configurações
    async getSetting(key) {
      if (!dbManager.db) await dbManager.init();
      
      return new Promise((resolve, reject) => {
        const transaction = dbManager.db.transaction([STORES.SETTINGS], 'readonly');
        const store = transaction.objectStore(STORES.SETTINGS);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result?.value);
      });
    },
    
    async setSetting(key, value) {
      return await dbManager.putToStore(STORES.SETTINGS, { key, value });
    },

    // Histórico
    async addToHistory(channelId, channelName, timestamp = Date.now()) {
      return await dbManager.addToStore(STORES.HISTORY, {
        channelId,
        channelName,
        timestamp
      });
    },
    
    async getHistory(limit = 10) {
      if (!dbManager.db) await dbManager.init();
      
      return new Promise((resolve, reject) => {
        const transaction = dbManager.db.transaction([STORES.HISTORY], 'readonly');
        const store = transaction.objectStore(STORES.HISTORY);
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        
        const results = [];
        
        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor && results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
      });
    },

    async getLastWatchedChannel() {
      const history = await this.getHistory(1);
      if (history.length > 0) {
        const channels = await this.getChannels();
        return channels.find(ch => ch.id === history[0].channelId);
      }
      return null;
    }
  };
};