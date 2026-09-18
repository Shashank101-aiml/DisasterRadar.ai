import { create } from 'zustand';
import type { StationData, ModelMetrics, RecentPrediction } from '../types/api';
import { fetchStations, fetchModelPerformance, fetchRecentPredictions } from '../services/api';

interface DataState {
  stations: StationData[];
  modelMetrics: ModelMetrics | null;
  recentPredictions: RecentPrediction[];
  isLoading: boolean;
  error: string | null;
  loadInitialData: () => Promise<void>;
  prependRecentPrediction: (entry: RecentPrediction) => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  stations: [],
  modelMetrics: null,
  recentPredictions: [],
  isLoading: false,
  error: null,
  loadInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [stations, modelMetrics, recentPredictions] = await Promise.all([
        fetchStations(),
        fetchModelPerformance(),
        fetchRecentPredictions()
      ]);
      set({ stations, modelMetrics, recentPredictions, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load dashboard data' });
    }
  },
  prependRecentPrediction: (entry) => {
    const next = [entry, ...get().recentPredictions].slice(0, 10);
    set({ recentPredictions: next });
  }
}));
