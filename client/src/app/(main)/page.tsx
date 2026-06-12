'use client'

import { useEffect } from "react";
import { MarketOverview } from "./components/market-overview"
import { useNavigation } from "@/context/nav-context";


export default function DashboardPage() {
  const { setNavItems } = useNavigation();
  useEffect(() => {
    setNavItems({
      title: 'MarketOverview',
      icon: '/images/dashboard.png'
    });
  }, []);
  
  return (
    <MarketOverview />
  )
}
