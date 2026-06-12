import {
  IconLayoutDashboard,
  IconPackages,
} from "@tabler/icons-react";
import { type SidebarData } from "../types";

export const sidebarData: SidebarData = {
  user: {
    name: "reoring",
    email: "reoring@gmail.com",
    avatar: "/avatars/default.svg",
  },
  header: {
    logo_url: "/images/logo.png",
    brand_name: "Tasmil Finance",
    tagline: "Your supreme agent",
  },
  navGroups: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: IconLayoutDashboard,
        },
      ],
    },
    {
      title: "Finance",
      items: [
        {
          title: "Portfolio",
          url: "/portfolio",
          icon: IconPackages,
        },
      ],
    },
  ],
};
