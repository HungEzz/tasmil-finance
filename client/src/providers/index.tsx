"use client";

import { PropsWithChildren } from "react";
import { ReactQueryClientProvider } from "./query";
import { WalletProvider } from "./wallet";
import { Toaster } from "sonner";
import { NavProvider } from "@/context/nav-context";
import { SessionProvider } from "next-auth/react";

export function AppProvider({ children }: PropsWithChildren) {
  return (
    <ReactQueryClientProvider>
      <WalletProvider>
        <SessionProvider>
          <NavProvider>{children}</NavProvider>
        </SessionProvider>
        <Toaster richColors position="top-right" />
      </WalletProvider>
    </ReactQueryClientProvider>
  );
}
