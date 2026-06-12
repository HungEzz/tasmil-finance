"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavGroup } from "@/components/layout/nav-group";
// import { NavUser } from './nav-user'
import { HeaderSidebar } from "@/components/layout/header-sidebar";
import { sidebarData } from "@/components/layout/data/sidebar-data";
import { useWalletStore } from "@/store/use-wallet";
import TasmilWallet from "@/components/wallet/tasmil-wallet";
import ConnectButton from "@/components/wallet/connect-button";
import { Wallet } from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { connected, signing } = useWalletStore();
  const { open: isOpen } = useSidebar();

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar" {...props}>
      <SidebarHeader>
        <HeaderSidebar header={sidebarData.header} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {isOpen && connected && !signing && <TasmilWallet />}
        {connected ? (
          <div className="w-full flex flex-col gap-2 items-center rounded-2xl p-3 glass border border-white/5">
            {isOpen ? (
              <>
                <p>Aptos Wallet</p>
                <ConnectButton className="w-full" />
              </>
            ) : (
              <Wallet className="h-4 w-4" />
            )}
          </div>
        ) : (
          <ConnectButton label={isOpen ? "Connect Aptos Wallet" : ""} />
        )}
        {/* <NavUser user={sidebarData.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
