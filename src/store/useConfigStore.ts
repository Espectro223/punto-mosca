import { create } from 'zustand';

export interface TaxConfig {
  general: number;
  reducido: number;
}

interface ConfigState {
  taxes: TaxConfig;
  updateTaxes: (newTaxes: Partial<TaxConfig>) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  taxes: {
    general: 21,
    reducido: 10.5,
  },
  updateTaxes: (newTaxes) => set((state) => ({
    taxes: { ...state.taxes, ...newTaxes }
  })),
}));
