// Hook otimizado para gerenciar dados no IndexedDB com cache e performance
import { useState, useEffect, useRef, useCallback } from 'react';

const DB_NAME = 'TVDashboardDB';
const DB_VERSION = 2; // Incrementado para suportar novas otimizações
const STORES = {
  CHANNELS: 'channels',
  PLAYLISTS: 'playlists',
  SETTINGS: 'settings',
  HISTORY: 'history',
  FAVORITES: 'favorites'
};

// Cache em memória para dados frequentemente acessados
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Função para criar chave de cache
const getCacheKey = (storeName, operation, params = '') => {
  return `${storeName}_${operation}_${params}`;
};

// Função para verificar se cache é válido
const isCacheValid = (cacheEntry) => {
  return cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_TTL;
};

// Debounce para operações de escrita
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

class OptimizedIndexedDBManager {
  constructor() {
    this.db = null;
    this.initPromise = null;
    this.writeQueue = new Map();
    this.processingQueue = false;
  }

  async init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        const oldVersion = event.oldVersion;

        // Store para canais com índices otimizados
        if (!db.objectStoreNames.contains(STORES.CHANNELS)) {
          const channelsStore = db.createObjectStore(STORES.CHANNELS, { keyPath: 'id' });
          channelsStore.createIndex('group', 'group', { unique: false });
          channelsStore.createIndex('name', 'name', { unique: false });
          channelsStore.createIndex('type', 'type', { unique: false });
          channelsStore.createIndex('playlistId', 'playlistId', { unique: false });
          channelsStore.createIndex('group_type', ['group', 'type'], { unique: false });
        } else if (oldVersion < 2) {
          // Atualizar índices se necessário
          const transaction = event.target.transaction;
          const channelsStore = transaction.objectStore(STORES.CHANNELS);

          if (!channelsStore.indexNames.contains('type')) {
            channelsStore.createIndex('type', 'type', { unique: false });
          }
          if (!channelsStore.indexNames.contains('playlistId')) {
            channelsStore.createIndex('playlistId', 'playlistId', { unique: false });
          }
          if (!channelsStore.indexNames.contains('group_type')) {
            channelsStore.createIndex('group_type', ['group', 'type'], { unique: false });
          }
        }

        // Store para playlists
        if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
          const playlistsStore = db.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
          playlistsStore.createIndex('name', 'name', { unique: false });
          playlistsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Store para configurações
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }

        // Store para histórico com TTL
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

    return this.initPromise;
  }

  // Operação paginada para grandes datasets
  async getPaginatedFromStore(storeName, page = 1, limit = 50, indexName = null, keyRange = null) {
    if (!this.db) await this.init();

    const cacheKey = getCacheKey(storeName, 'paginated', `${page}_${limit}_${indexName}`);
    const cached = memoryCache.get(cacheKey);

    if (isCacheValid(cached)) {
      return cached.data;
    }

    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} não existe`);
      return { data: [], total: 0, hasMore: false };
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const source = indexName ? store.index(indexName) : store;

        let cursorRequest;
        if (keyRange) {
          cursorRequest = source.openCursor(keyRange);
        } else {
          cursorRequest = source.openCursor();
        }

        const results = [];
        let count = 0;
        const skip = (page - 1) * limit;

        cursorRequest.onsuccess = (event) => {
          const cursor = event.target.result;

          if (cursor) {
            if (count >= skip && results.length < limit) {
              results.push(cursor.value);
            }
            count++;

            if (results.length < limit) {
              cursor.continue();
            } else {
              const result = {
                data: results,
                total: count,
                hasMore: count > skip + limit,
                page,
                limit
              };

              memoryCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });

              resolve(result);
            }
          } else {
            const result = {
              data: results,
              total: count,
              hasMore: false,
              page,
              limit
            };

            memoryCache.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });

            resolve(result);
          }
        };

        cursorRequest.onerror = () => reject(cursorRequest.error);
      } catch (error) {
        console.error(`Erro ao buscar paginado do store ${storeName}:`, error);
        resolve({ data: [], total: 0, hasMore: false });
      }
    });
  }

  // Busca otimizada com índices
  async searchInStore(storeName, searchTerm, searchFields = ['name'], limit = 100) {
    if (!this.db) await this.init();

    const cacheKey = getCacheKey(storeName, 'search', `${searchTerm}_${searchFields.join('_')}`);
    const cached = memoryCache.get(cacheKey);

    if (isCacheValid(cached)) {
      return cached.data;
    }

    if (!this.db.objectStoreNames.contains(storeName)) {
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const allData = request.result;
          const searchTermLower = searchTerm.toLowerCase();

          const filtered = allData.filter(item => {
            return searchFields.some(field => {
              const value = item[field];
              return value && value.toLowerCase().includes(searchTermLower);
            });
          }).slice(0, limit);

          memoryCache.set(cacheKey, {
            data: filtered,
            timestamp: Date.now()
          });

          resolve(filtered);
        };

        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error(`Erro na busca do store ${storeName}:`, error);
        resolve([]);
      }
    });
  }

  // Operação em lote otimizada
  async batchOperation(storeName, operations) {
    if (!this.db) await this.init();

    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} não existe`);
      return { success: false, errors: ['Store não existe'] };
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const results = [];
        const errors = [];

        let completed = 0;
        const total = operations.length;

        if (total === 0) {
          resolve({ success: true, results: [], errors: [] });
          return;
        }

        operations.forEach((operation, index) => {
          let request;

          switch (operation.type) {
            case 'add':
              request = store.add(operation.data);
              break;
            case 'put':
              request = store.put(operation.data);
              break;
            case 'delete':
              request = store.delete(operation.key);
              break;
            default:
              errors.push(`Operação inválida no índice ${index}: ${operation.type}`);
              completed++;
              return;
          }

          request.onsuccess = () => {
            results[index] = request.result;
            completed++;

            if (completed === total) {
              // Invalidar cache relacionado
              this.invalidateCache(storeName);
              resolve({ success: true, results, errors });
            }
          };

          request.onerror = () => {
            errors.push(`Erro na operação ${index}: ${request.error}`);
            completed++;

            if (completed === total) {
              resolve({ success: errors.length === 0, results, errors });
            }
          };
        });
      } catch (error) {
        console.error(`Erro na operação em lote do store ${storeName}:`, error);
        reject(error);
      }
    });
  }

  async getAllFromStore(storeName) {
    if (!this.db) await this.init();

    const cacheKey = getCacheKey(storeName, 'getAll');
    const cached = memoryCache.get(cacheKey);

    if (isCacheValid(cached)) {
      return cached.data;
    }

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
        request.onsuccess = () => {
          const result = request.result;

          memoryCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });

          resolve(result);
        };
      } catch (error) {
        console.error(`Erro ao acessar store ${storeName}:`, error);
        resolve([]);
      }
    });
  }

  async putToStore(storeName, data) {
    if (!this.db) await this.init();

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
        request.onsuccess = () => {
          // Invalidar cache relacionado
          this.invalidateCache(storeName);
          resolve(request.result);
        };
      } catch (error) {
        console.error(`Erro ao atualizar no store ${storeName}:`, error);
        reject(error);
      }
    });
  }

  async deleteFromStore(storeName, key) {
    if (!this.db) await this.init();

    if (!this.db.objectStoreNames.contains(storeName)) {
      console.warn(`Store ${storeName} não existe`);
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          // Invalidar cache relacionado
          this.invalidateCache(storeName);
          resolve(request.result);
        };
      } catch (error) {
        console.error(`Erro ao deletar do store ${storeName}:`, error);
        reject(error);
      }
    });
  }

  // Invalidar cache específico
  invalidateCache(storeName) {
    const keysToDelete = [];
    for (const [key] of memoryCache) {
      if (key.startsWith(storeName)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => memoryCache.delete(key));
  }

  // Limpeza de cache expirado
  cleanExpiredCache() {
    for (const [key, value] of memoryCache) {
      if (!isCacheValid(value)) {
        memoryCache.delete(key);
      }
    }
  }

  // Estatísticas do cache
  getCacheStats() {
    let total = 0;
    let expired = 0;

    for (const [key, value] of memoryCache) {
      total++;
      if (!isCacheValid(value)) {
        expired++;
      }
    }

    return { total, expired, active: total - expired };
  }
}

// Instância singleton
const dbManager = new OptimizedIndexedDBManager();

// Limpeza periódica do cache
setInterval(() => {
  dbManager.cleanExpiredCache();
}, 2 * 60 * 1000); // A cada 2 minutos

export const useOptimizedIndexedDB = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initDB = async () => {
      try {
        await dbManager.init();
        setIsReady(true);
      } catch (err) {
        console.error('Erro ao inicializar IndexedDB otimizado:', err);
        setError(err);
      }
    };

    initDB();
  }, []);

  // Hook para canais com cache
  const getChannels = useCallback(async () => {
    try {
      return await dbManager.getAllFromStore(STORES.CHANNELS);
    } catch (err) {
      console.error('Erro ao buscar canais:', err);
      return [];
    }
  }, []);

  // Hook para canais paginados
  const getChannelsPaginated = useCallback(async (page = 1, limit = 50, filters = {}) => {
    try {
      if (filters.group && filters.type) {
        const keyRange = IDBKeyRange.only([filters.group, filters.type]);
        return await dbManager.getPaginatedFromStore(STORES.CHANNELS, page, limit, 'group_type', keyRange);
      } else if (filters.group) {
        const keyRange = IDBKeyRange.only(filters.group);
        return await dbManager.getPaginatedFromStore(STORES.CHANNELS, page, limit, 'group', keyRange);
      } else if (filters.type) {
        const keyRange = IDBKeyRange.only(filters.type);
        return await dbManager.getPaginatedFromStore(STORES.CHANNELS, page, limit, 'type', keyRange);
      }

      return await dbManager.getPaginatedFromStore(STORES.CHANNELS, page, limit);
    } catch (err) {
      console.error('Erro ao buscar canais paginados:', err);
      return { data: [], total: 0, hasMore: false };
    }
  }, []);

  // Busca de canais otimizada
  const searchChannels = useCallback(async (searchTerm, limit = 100) => {
    try {
      return await dbManager.searchInStore(STORES.CHANNELS, searchTerm, ['name', 'group'], limit);
    } catch (err) {
      console.error('Erro na busca de canais:', err);
      return [];
    }
  }, []);

  // Salvar canais em lote
  const saveChannelsBatch = useCallback(async (channels) => {
    try {
      const operations = channels.map(channel => ({
        type: 'put',
        data: channel
      }));

      return await dbManager.batchOperation(STORES.CHANNELS, operations);
    } catch (err) {
      console.error('Erro ao salvar canais em lote:', err);
      return { success: false, errors: [err.message] };
    }
  }, []);

  const saveChannels = useCallback(async (channels) => {
    return await saveChannelsBatch(channels);
  }, [saveChannelsBatch]);

  // Outros métodos otimizados
  const getPlaylists = useCallback(async () => {
    try {
      return await dbManager.getAllFromStore(STORES.PLAYLISTS);
    } catch (err) {
      console.error('Erro ao buscar playlists:', err);
      return [];
    }
  }, []);

  const savePlaylist = useCallback(async (playlist) => {
    try {
      return await dbManager.putToStore(STORES.PLAYLISTS, playlist);
    } catch (err) {
      console.error('Erro ao salvar playlist:', err);
      throw err;
    }
  }, []);

  const deletePlaylist = useCallback(async (id) => {
    try {
      return await dbManager.deleteFromStore(STORES.PLAYLISTS, id);
    } catch (err) {
      console.error('Erro ao deletar playlist:', err);
      throw err;
    }
  }, []);

  const getFavorites = useCallback(async () => {
    try {
      return await dbManager.getAllFromStore(STORES.FAVORITES);
    } catch (err) {
      console.error('Erro ao buscar favoritos:', err);
      return [];
    }
  }, []);

  const addToFavorites = useCallback(async (channelId, channelName, channelUrl) => {
    try {
      const favorite = {
        channelId,
        channelName,
        channelUrl,
        timestamp: Date.now()
      };
      return await dbManager.putToStore(STORES.FAVORITES, favorite);
    } catch (err) {
      console.error('Erro ao adicionar favorito:', err);
      throw err;
    }
  }, []);

  const removeFromFavorites = useCallback(async (channelId) => {
    try {
      return await dbManager.deleteFromStore(STORES.FAVORITES, channelId);
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
      throw err;
    }
  }, []);

  const getHistory = useCallback(async (limit = 50) => {
    try {
      const allHistory = await dbManager.getAllFromStore(STORES.HISTORY);
      return allHistory
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
      return [];
    }
  }, []);

  const addToHistory = useCallback(async (channelId, channelName) => {
    try {
      const historyEntry = {
        channelId,
        channelName,
        timestamp: Date.now()
      };
      return await dbManager.putToStore(STORES.HISTORY, historyEntry);
    } catch (err) {
      console.error('Erro ao adicionar ao histórico:', err);
    }
  }, []);

  // Métodos de diagnóstico
  const getCacheStats = useCallback(() => {
    return dbManager.getCacheStats();
  }, []);

  const clearCache = useCallback(() => {
    memoryCache.clear();
  }, []);

  // Métodos para configurações
  const getSetting = useCallback(async (key) => {
    try {
      if (!dbManager.db.objectStoreNames.contains(STORES.SETTINGS)) {
        return null;
      }

      const transaction = dbManager.db.transaction([STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Erro ao buscar configuração:', err);
      return null;
    }
  }, []);

  const setSetting = useCallback(async (key, value) => {
    try {
      return await dbManager.putToStore(STORES.SETTINGS, { key, value });
    } catch (err) {
      console.error('Erro ao salvar configuração:', err);
      throw err;
    }
  }, []);

  return {
    isReady,
    error,

    // Métodos básicos
    getChannels,
    saveChannels,
    getPlaylists,
    savePlaylist,
    deletePlaylist,
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    getHistory,
    addToHistory,

    // Métodos de configurações
    getSetting,
    setSetting,

    // Métodos otimizados
    getChannelsPaginated,
    searchChannels,
    saveChannelsBatch,

    // Métodos de diagnóstico
    getCacheStats,
    clearCache
  };
};