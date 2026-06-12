"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Ellipsis } from "lucide-react";
import ButtonCopy from "@/components/wallet/menu/button-copy";
import ButtonExplorer from "@/components/wallet/menu/button-explorer";

interface ButtonEllipsisProps {
  address: string;
}

export function ButtonEllipsis({ address }: ButtonEllipsisProps) {
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Ellipsis className="h-4 w-4 " />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">Wallet Options</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <ButtonCopy address={address} />
        <ButtonExplorer address={address} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
