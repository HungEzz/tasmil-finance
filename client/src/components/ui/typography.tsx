import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
/**
 * Typography component
 * @param {string} variant - The variant of the typography.
 * @param {string} weight - The weight of the typography.
 * @param {string} align - The alignment of the typography.
 * @param {string} font - The font family to use.
 * @param {string} size - The size of the text.
 * @param {React.ElementType} as - The element type to render the typography as.
 * @param {React.ReactNode} children - The children of the typography.
 * @param {string} className - The class name to apply to the typography.
 * @param {React.ComponentPropsWithoutRef<C>} props - The props to apply to the typography.
 * @returns {React.ReactElement} The typography component.
 * @example
 * <Typography>Nomal text</Typography>
 * <Typography variant="h1">Heading 1</Typography>
 * <Typography variant="h2">Heading 2</Typography>
 * <Typography variant="h3">Heading 3</Typography>
 * <Typography variant="lead">Lead text</Typography>
 * <Typography variant="large">Large text</Typography>
 * <Typography variant="small">Small text</Typography>
 * <Typography variant="muted">Muted text</Typography>
 * <Typography weight="normal">Normal text</Typography>
 * <Typography weight="medium">Medium text</Typography>
 * <Typography weight="bold">Bold text</Typography>
 * <Typography align="left">Align left</Typography>
 * <Typography align="center">Align center</Typography>
 * <Typography align="right">Align right</Typography>
 * <Typography variant="h1" align="center" weight="bold">Heading 1 align center and bold</Typography>
 * <Typography as="span" variant="small">Inline text</Typography>
 * <Typography as="label" variant="muted">Form label</Typography>
 * <Typography className="my-4 text-blue-500">Text with margin and custom color</Typography>
 * <Typography gradient>Gradient text</Typography>
 */
const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20",
      h2: "scroll-m-20",
      h3: "scroll-m-20",
      h4: "scroll-m-20",
      h5: "scroll-m-20",
      p: "",
      small: "",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
      extrabold: "font-extrabold",
      black: "font-black",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
    color: {
      primary: "text-primary",
      secondary: "text-secondary",
      embossed: "text-embossed",
      submerged: "text-submerged",
      boosted: "text-boosted",
      destructive: "text-destructive",
      foreground: "text-foreground",
      background: "text-background",
    },
    gradient: {
      true: "bg-gradient-to-r from-[#B5EAFF] to-[#00BFFF] bg-clip-text text-transparent",
      false: "",
    },
    size: {
      // Default sizes
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    variant: "p",
    weight: "normal",
    align: "left",
    color: "foreground",
    size: "base",
    gradient: false,
  },
});

interface TypographyProps<C extends React.ElementType>
  extends VariantProps<typeof typographyVariants> {
  as?: C;
  children: React.ReactNode;
  className?: string;
  props?: React.ComponentPropsWithoutRef<C>;
  color1?: string;
  color2?: string;
  direction?:
    | "to-t"
    | "to-tr"
    | "to-r"
    | "to-br"
    | "to-b"
    | "to-bl"
    | "to-l"
    | "to-tl";
  linear?: boolean;
}

export function Typography<C extends React.ElementType = "p">({
  className,
  variant,
  weight,
  align,
  color,
  size,
  as,
  children,
  gradient = false,
  linear = false,
  color1 = "rgba(255,255,255,0.5)",
  color2 = "rgba(255,255,255,1)",
  direction = "to-b",
  ...props
}: TypographyProps<C>) {
  const Component =
    as || (variant as React.ElementType) || ("p" as React.ElementType);

  const combinedClassName = cn(
    typographyVariants({ variant, weight, align, color, size, gradient }),
    linear
      ? `bg-gradient-${direction} from-[${color1}] to-[${color2}] bg-clip-text text-transparent`
      : "",
    className
  );

  return (
    <Component className={combinedClassName} {...props}>
      {children}
    </Component>
  );
}
