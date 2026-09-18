import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'disaster_offline_cache_v1';

export interface CacheMetadata {
  tilesCount: number;
  sizeBytes: string;
  lastSyncTime: string;
  status: string;
}

interface OfflineState {
  cachedRadiusKm: number | null;
  packId: string | null;
  cacheMetadata: CacheMetadata | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setCache: (radiusKm: number, packId: string, metadata: CacheMetadata) => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  cachedRadiusKm: null,
  packId: null,
  cacheMetadata: null,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({ ...parsed, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
  setCache: async (radiusKm, packId, metadata) => {
    const next = { cachedRadiusKm: radiusKm, packId, cacheMetadata: metadata };
    set(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // best-effort persistence; in-memory state still updated
    }
  },
  clearCache: async () => {
    set({ cachedRadiusKm: null, packId: null, cacheMetadata: null });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}));
