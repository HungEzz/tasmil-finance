import { PATHS } from "@/constants/routes";
import { 
  LayoutDashboard, 
  Bot, 
  Users, 
  PieChart,
  LucideIcon 
} from "lucide-react";

export type SubmenuType = {
  href: string;
  label: string;
  active?: boolean;
};

export type MenuType = {
  href: string;
  label: string;
  active?: boolean;
  image: string;
  icon: LucideIcon;
  submenus?: SubmenuType[];
};

export type GroupType = {
  groupLabel: string;
  menus: MenuType[];
};

export function getMenuList(): GroupType[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: PATHS.DASHBOARD,
          label: "Dashboard",
          image: "/sidebar/dashboard.png",
          icon: LayoutDashboard,
        },

        {
          href: PATHS.DEFI_AGENT,
          label: "Defi Agent",
          image: "/sidebar/defi-agent.png",
          icon: Bot,
        },
        {
          href: PATHS.COMMUNITY,
          label: "Community",
          image: "/sidebar/community.png",
          icon: Users,
        },
        {
          href: PATHS.PORTFOLIO,
          label: "Portfolio",
          image: "/sidebar/portfolio.png",
          icon: PieChart,
        },
      ],
    },
  ];
}
