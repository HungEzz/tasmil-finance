"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "../../lib/utils";
import { Typography } from "../ui/typography";
import Image from "next/image";

// TopNavProps now supports optional description for richer context in header
interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  header: {
    title: string;
    icon?: string;
    description?: string; // Optional description field
  };
}

// TopNav displays title, icon, and (if present) description under the title
export function TopNav({ className, header, ...props }: TopNavProps) {
  const { title, icon, description } = header;
  const isMobile = useIsMobile();
  return (
    <nav
      className={cn(
        "flex flex-row items-center space-x-1 md:flex lg:space-x-3",
        className
      )}
      {...props}
    >
      {/* Show icon on desktop for visual context */}
      {!isMobile && icon && (
        <Image src={icon || ""} alt="logo" width={45} height={45} />
      )}
      <div className="flex flex-col gap-2">
        {/* Main title */}
        <Typography className="text-sm md:text-xl font-semibold -mb-2">
          {title}
        </Typography>
        {/* Optional description for extra context */}
        {description && (
          <Typography className="text-xs md:text-sm text-muted-foreground mt-1">
            {description}
          </Typography>
        )}
      </div>
    </nav>
  );
}
