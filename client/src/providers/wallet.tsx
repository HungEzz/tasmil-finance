"use client";

import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PropsWithChildren } from "react";
import { Network } from "@aptos-labs/ts-sdk";
import { ConnectionHandler } from "./connection";

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: Network.MAINNET }}
      optInWallets={["Petra", "Pontem Wallet", "Nightly", "OKX Wallet"]}
    >
      <ConnectionHandler />
      {children}
    </AptosWalletAdapterProvider>
  );
}
