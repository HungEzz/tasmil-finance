"use client"

import { useEffect } from "react";
import Portfolio from "./components";
import { useNavigation } from "@/context/nav-context";


const PortfolioPage = () => {
  const { setNavItems } = useNavigation();

  useEffect(() => {
    setNavItems({
      title: 'Portfolio', 
      icon: '/images/portfolio.png'
    });
  }, []);

  return (
      <Portfolio />
  );
};

export default PortfolioPage;
