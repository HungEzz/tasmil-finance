import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        galaxy:
          "border-2 border-input bg-transparent shadow-[0_0_8px_2px_rgba(99,102,241,0.7),0_0_24px_8px_rgba(99,102,241,0.3)] transition-all duration-300 hover:shadow-[0_0_10px_4px_rgba(99,102,241,0.7),0_0_48px_16px_rgba(99,102,241,0.3)]",
        gradient:
          "bg-gradient-to-b from-[#B5EAFF] to-[#00BFFF] hover:from-[#C5F0FF] hover:to-[#1CCFFF] transition-all duration-300 hover:scale-105 relative overflow-hidden group",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        "secondary-gradient":
          "background-gradient1 text-black hover:bg-secondary/80",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  logo?: string;
  logoAlt?: string;
  logoSize?: number;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      logo,
      logoAlt,
      logoSize = 20,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const buttonContent = (
      <>
        {variant === "gradient" && (
          <div className="absolute w-[50%] h-4 top-0 left-1/2 -translate-x-1/2 bg-white/80 rounded-full blur-xl" />
        )}
        {logo && (
          <div className="w-8 h-8 flex items-center justify-center bg-black rounded-lg group-hover:bg-[#0a0a0a] transition-all duration-300 mr-2">
            <Image
              src={logo}
              alt={logoAlt || "Logo"}
              width={logoSize}
              height={logoSize}
              loading="eager"
              quality={90}
              className="transition-transform duration-300 group-hover:scale-110"
            />
          </div>
        )}
        {children}
      </>
    );

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          <span style={{ display: "contents" }}>{buttonContent}</span>
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {buttonContent}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
