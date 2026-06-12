"use client";

import * as React from "react";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Typography } from "@/components/ui/typography";

export function HeaderSidebar({
  header,
}: {
  header: {
    logo_url: string;
    brand_name: string;
    tagline: string;
  };
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Image
              src={header.logo_url}
              alt={header.brand_name}
              width={42}
              height={42}
            />
            <div className="grid flex-1 text-left leading-tight ml-1 gap-1">
              <Typography gradient className="truncate font-semibold text-lg">
                {header.brand_name}
              </Typography>
              <Typography variant="p" className="text-sm">
                {header.tagline}
              </Typography>
            </div>
          </SidebarMenuButton>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
