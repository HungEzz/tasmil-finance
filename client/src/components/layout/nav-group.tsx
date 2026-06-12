"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "../ui/sidebar";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { NavCollapsible, NavItem, NavLink, type NavGroup } from "./types";

export function NavGroup({ title, items }: NavGroup) {
  const { state } = useSidebar();
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`;

          if (!item.items)
            return (
              <SidebarMenuLink key={key} item={item} pathname={pathname} />
            );

          if (state === "collapsed")
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                pathname={pathname}
              />
            );

          return (
            <SidebarMenuCollapsible key={key} item={item} pathname={pathname} />
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

const NavBadge = ({ children }: { children: ReactNode }) => (-
  <Badge className="text-sm rounded-full px-1 py-0">{children}</Badge>
);

const SidebarMenuLink = ({
  item,
  pathname,
}: {
  item: NavLink;
  pathname: string;
}) => {
  const { setOpenMobile } = useSidebar();
  // Check if this is a main nav item that should match sub-routes
  const isMainNav =
    item.url === "/defi-agent" ||
    item.url === "/explore-agent" ||
    item.url === "/custom-agent";
  const isActive = checkIsActive(pathname, item, isMainNav);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        className={isActive ? "sidebar-item-active" : ""}
      >
        <Link
          href={item.url}
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-3"
        >
          {item.icon && (
            <item.icon className={`h-4 w-4 ${isActive ? "text-black" : ""}`} />
          )}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const SidebarMenuCollapsible = ({
  item,
  pathname,
}: {
  item: NavCollapsible;
  pathname: string;
}) => {
  const { setOpenMobile } = useSidebar();
  const isActive = checkIsActive(pathname, item, true);

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            className={`flex items-center gap-3 ${
              isActive ? "sidebar-item-active" : ""
            }`}
          >
            {item.icon && (
              <item.icon
                className={`h-4 w-4 ${isActive ? "text-black" : ""}`}
              />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const isSubActive = checkIsActive(pathname, subItem);
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isSubActive}
                    className={isSubActive ? "sidebar-item-active" : ""}
                  >
                    <Link
                      href={subItem.url}
                      onClick={() => setOpenMobile(false)}
                      className="flex items-center gap-3"
                    >
                      {subItem.icon && (
                        <subItem.icon
                          className={`h-4 w-4 ${
                            isSubActive ? "text-black" : ""
                          }`}
                        />
                      )}
                      <span className={isSubActive ? "text-black" : ""}>
                        {subItem.title}
                      </span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

const SidebarMenuCollapsedDropdown = ({
  item,
  pathname,
}: {
  item: NavCollapsible;
  pathname: string;
}) => {
  const isActive = checkIsActive(pathname, item);

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            className={`flex items-center gap-3 ${
              isActive ? "sidebar-item-active" : ""
            }`}
          >
            {item.icon && (
              <item.icon
                className={`h-4 w-4 ${isActive ? "text-black" : ""}`}
              />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel className="text-sm text-muted-foreground">
            {item.title} {item.badge ? `(${item.badge})` : ""}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const isSubActive = checkIsActive(pathname, sub);
            return (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <Link
                  href={sub.url}
                  className={`flex items-center gap-3 ${
                    isSubActive ? "sidebar-item-active" : ""
                  }`}
                >
                  {sub.icon && (
                    <sub.icon
                      className={`h-4 w-4 ${isSubActive ? "text-black" : ""}`}
                    />
                  )}
                  <span
                    className={`max-w-52 text-wrap ${
                      isSubActive ? "text-black" : ""
                    }`}
                  >
                    {sub.title}
                  </span>
                  {sub.badge && (
                    <span
                      className={`ml-auto text-sm ${
                        isSubActive ? "text-black" : ""
                      }`}
                    >
                      {sub.badge}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

function checkIsActive(pathname: string, item: NavItem, mainNav = false) {
  // Exact match
  if (pathname === item.url || pathname.split("?")[0] === item.url) {
    return true;
  }

  // Check if child nav is active
  if (item?.items?.filter((i) => i.url === pathname).length) {
    return true;
  }

  // For main nav items, check if current path starts with the item URL
  // This handles cases like /defi-agent/[id] matching /defi-agent
  if (mainNav && item.url && pathname.startsWith(item.url + "/")) {
    return true;
  }

  // Legacy check for first segment match
  if (
    mainNav &&
    pathname.split("/")[1] !== "" &&
    pathname.split("/")[1] === item?.url?.split("/")[1]
  ) {
    return true;
  }

  return false;
}
