import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WalletState {
  // Core state
  connected: boolean;
  account: string | null;
  tasmilAddress: string | null;
  signing: boolean;

  // Actions
  setWalletState: (state: {
    connected: boolean;
    account: string | null;
    tasmilAddress: string | null;
  }) => void;
  setSigning: (signing: boolean) => void;
  setTasmilAddress: (tasmilAddress: string | null) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      // Initial state
      connected: false,
      account: null,
      tasmilAddress: null,
      signing: false,

      // Actions
      setWalletState: ({ connected, account, tasmilAddress }) =>
        set({
          connected,
          account,
          tasmilAddress,
        }),

      setSigning: (signing) => set({ signing }),

      setTasmilAddress: (tasmilAddress) => set({ tasmilAddress }),

      reset: () =>
        set({
          connected: false,
          account: null,
          tasmilAddress: null,
          signing: false,
        }),
    }),
    {
      name: "wallet-storage",
      partialize: (state) => ({
        connected: state.connected,
        account: state.account,
        tasmilAddress: state.tasmilAddress,
      }),
    },
  ),
);
