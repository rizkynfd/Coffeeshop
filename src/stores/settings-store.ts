import { create } from 'zustand';

interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  taxRate: number;
  serviceCharge: number;
  receiptFooter1: string;
  receiptFooter2: string;
  printLogo: boolean;
}

interface SettingsState {
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    storeName: 'KopiShop - Cabang Utama',
    storeAddress: 'Jl. Kopi No. 123, Surabaya, Jawa Timur 60111',
    storePhone: '(031) 1234-5678',
    storeEmail: 'hello@kopishop.com',
    taxRate: 11,
    serviceCharge: 0,
    receiptFooter1: 'Terima kasih!',
    receiptFooter2: 'Selamat menikmati ☕',
    printLogo: true,
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
  },
}));
