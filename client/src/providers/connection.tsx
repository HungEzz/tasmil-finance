"use client";

import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useRef } from "react";
import { useWalletStore } from "@/store/use-wallet";
import { AuthService } from "@/services/auth.service";

export function ConnectionHandler() {
  const { connected } = useWallet();
  const { connected: storeConnected, reset: resetWalletState } =
    useWalletStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Only reset if we were previously connected and now disconnected
    // This prevents resetting on initial load
    if (hasInitialized.current && !connected && storeConnected) {
      resetWalletState();
      AuthService.logout();
    }

    if (connected || storeConnected) {
      hasInitialized.current = true;
    }
  }, [connected, storeConnected, resetWalletState]);

  return null;
}
