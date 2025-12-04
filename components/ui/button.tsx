import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 hover:scale-105",
        destructive:
          "bg-gradient-to-r from-rose-600 to-rose-500 dark:from-rose-500 dark:to-rose-600 text-white shadow-md hover:shadow-lg hover:from-rose-700 hover:to-rose-600 dark:hover:from-rose-600 dark:hover:to-rose-700 hover:scale-105",
        outline:
          "border-2 border-input bg-background hover:bg-muted hover:border-primary transition-colors",
        secondary:
          "bg-gradient-to-r from-purple-600 to-purple-500 dark:from-purple-500 dark:to-purple-600 text-white shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-600 dark:hover:from-purple-600 dark:hover:to-purple-700 hover:scale-105",
        ghost: "hover:bg-muted transition-colors",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
