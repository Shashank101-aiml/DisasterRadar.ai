import { create } from 'zustand';
import type { PredictionInput, PredictionResponse } from '../types/api';

export interface ActiveLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

interface AppState {
  activeLocation: ActiveLocation;
  params: PredictionInput;
  prediction: PredictionResponse | null;
  setActiveLocation: (loc: ActiveLocation) => void;
  setParams: (params: Partial<PredictionInput>) => void;
  setPrediction: (prediction: PredictionResponse | null) => void;
  /** Mirrors web App.jsx's onLocationChange(loc, params, prediction) callback bubbling. */
  applyPredictionResult: (loc: ActiveLocation, params: PredictionInput, prediction: PredictionResponse) => void;
}

const DEFAULT_PARAMS: PredictionInput = {
  rainfall24h: 85,
  rainfall72h: 190,
  temperature: 25,
  humidity: 82,
  windSpeed: 12,
  pressure: 1005,
  elevation: 900,
  latitude: 12.97,
  longitude: 77.59,
  location: 'Bengaluru, Karnataka'
};

export const useAppStore = create<AppState>((set) => ({
  activeLocation: { name: 'Mira Bhayandar', country: 'India', lat: 19.2952, lng: 72.8544 },
  params: DEFAULT_PARAMS,
  prediction: null,
  setActiveLocation: (activeLocation) => set({ activeLocation }),
  setParams: (partial) => set((state) => ({ params: { ...state.params, ...partial } })),
  setPrediction: (prediction) => set({ prediction }),
  applyPredictionResult: (activeLocation, params, prediction) => set({ activeLocation, params, prediction })
}));
