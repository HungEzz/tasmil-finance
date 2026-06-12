"use client";

import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { SearchProvider } from "@/context/search-context";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { Main } from "@/components/ui/main";
import { useNavigation } from "@/context/nav-context";
import { TopNav } from "@/components/layout/top-nav";

const inter = Inter({ subsets: ["latin"] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navItems } = useNavigation();
  const pathname = usePathname();
  const isDefiAgent = pathname?.startsWith("/defi-agent");

  return (
    <div className={inter.className}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div>
          <SidebarProvider>
            <SearchProvider>
              <AppSidebar />
              <div
                id="content"
                className={cn(
                  "max-w-full w-full ml-auto",
                  "peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]",
                  "peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]",
                  "transition-[width] ease-linear duration-200",
                  "h-svh flex flex-col",
                  "group-data-[scroll-locked=1]/body:h-full",
                  "group-data-[scroll-locked=1]/body:has-[main.fixed-main]:h-svh"
                )}
              >
                <Main fixed>
                  {!isDefiAgent && (
                    <Header>
                      <TopNav header={navItems} />
                      <div className="ml-auto flex items-center space-x-4">
                        <Search />
                        <ThemeSwitch />
                        <ProfileDropdown />
                      </div>
                    </Header>
                  )}
                  {children}
                </Main>
              </div>
            </SearchProvider>
          </SidebarProvider>
        </div>
      </ThemeProvider>
    </div>
  );
}
