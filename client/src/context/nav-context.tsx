'use client'

import { createContext, useContext, useState } from 'react'

export interface NavItem {
  title: string;
  icon?: string;
  description?: string;
}

interface NavContextType {
  navItems: NavItem;
  setNavItems: (items: NavItem) => void;
}

const NavContext = createContext<NavContextType>({
  navItems: {
    title: "",
    icon: "",
    description: ""
  },
  setNavItems: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [navItems, setNavItems] = useState<NavItem>({
    title: "",
    icon: "",
    description: ""
  });

  return (
    <NavContext.Provider value={{ navItems, setNavItems }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavContext);
  
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavProvider');
  }
  
  return context;
};