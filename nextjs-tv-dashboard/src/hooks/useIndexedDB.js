// Hook para gerenciar dados no IndexedDB
import { useState, useEffect } from 'react';

const DB_NAME = 'TVDashboardDB';
const DB_VERSION = 1;
const STORES = {
  CHANNELS: 'channels',
  PLAYLISTS: 'playlists',
  SETTINGS: 'settings',
  HISTORY: 'history',
  FAVORITES: 'favorites'
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

        // Store para favoritos
        if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
          const favoritesStore = db.createObjectStore(STORES.FAVORITES, { keyPath: 'channelId' });
          favoritesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async getAllFromStore(storeName) {
    if (!this.db) await this.init();

    // Verificar se o store existe
    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} não existe, retornando array vazio`);
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      } catch (error) {
        console.error(`Erro ao acessar store ${storeName}:`, error);
        resolve([]);
      }
    });
  }

  async addToStore(storeName, data) {
    if (!this.db) await this.init();

    // Verificar se o store existe
    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} não existe`);
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(data);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      } catch (error) {
        console.error(`Erro ao adicionar no store ${storeName}:`, error);
        reject(error);
      }
    });
  }

  async putToStore(storeName, data) {
    if (!this.db) await this.init();

    // Verificar se o store existe
    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} não existe`);
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      } catch (error) {
        console.error(`Erro ao atualizar no store ${storeName}:`, error);
        reject(error);
      }
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
      const history = await dbManager.getAllFromStore(STORES.HISTORY);
      if (history.length > 0) {
        // Ordenar por timestamp (mais recente primeiro)
        const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
        const channels = await dbManager.getAllFromStore(STORES.CHANNELS);
        return channels.find(ch => ch.id === sortedHistory[0].channelId);
      }
      return null;
    },

    // Favoritos
    async getFavorites() {
      return await dbManager.getAllFromStore(STORES.FAVORITES);
    },

    async addToFavorites(channelId, channelName, channelUrl) {
      return await dbManager.putToStore(STORES.FAVORITES, {
        channelId,
        channelName,
        channelUrl,
        timestamp: Date.now()
      });
    },

    async removeFromFavorites(channelId) {
      return await dbManager.deleteFromStore(STORES.FAVORITES, channelId);
    },

    async isFavorite(channelId) {
      if (!dbManager.db) await dbManager.init();

      return new Promise((resolve, reject) => {
        const transaction = dbManager.db.transaction([STORES.FAVORITES], 'readonly');
        const store = transaction.objectStore(STORES.FAVORITES);
        const request = store.get(channelId);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(!!request.result);
      });
    },

    // Funções utilitárias para diferenciação VOD/Canais
    async getChannelsByType(type = 'live') {
      const allChannels = await dbManager.getAllFromStore(STORES.CHANNELS);
      return allChannels.filter(channel => channel.type === type);
    },

    async getChannelsStats() {
      const allChannels = await dbManager.getAllFromStore(STORES.CHANNELS);
      const live = allChannels.filter(ch => ch.type === 'live').length;
      const vod = allChannels.filter(ch => ch.type === 'vod').length;
      return { live, vod, total: allChannels.length };
    },

    // Limpeza de dados
    async clearAllData() {
      const promises = Object.values(STORES).map(store => dbManager.clearStore(store));
      return await Promise.all(promises);
    }
  };
};