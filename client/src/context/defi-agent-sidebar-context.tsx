"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface DefiAgentSidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

const DefiAgentSidebarContext =
  createContext<DefiAgentSidebarContextType | null>(null);

interface DefiAgentSidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function DefiAgentSidebarProvider({
  children,
  defaultOpen = false,
}: DefiAgentSidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("defi-agent-sidebar-open");
    if (saved !== null) {
      setIsOpen(JSON.parse(saved));
    }
  }, []);

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    localStorage.setItem("defi-agent-sidebar-open", JSON.stringify(newState));
  };

  const setOpen = (open: boolean) => {
    setIsOpen(open);
    localStorage.setItem("defi-agent-sidebar-open", JSON.stringify(open));
  };

  return (
    <DefiAgentSidebarContext.Provider value={{ isOpen, toggle, setOpen }}>
      {children}
    </DefiAgentSidebarContext.Provider>
  );
}

export function useDefiAgentSidebar() {
  const context = useContext(DefiAgentSidebarContext);
  if (!context) {
    throw new Error(
      "useDefiAgentSidebar must be used within a DefiAgentSidebarProvider"
    );
  }
  return context;
}
