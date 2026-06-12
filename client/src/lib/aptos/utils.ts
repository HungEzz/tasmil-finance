import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  // For values less than 1, show up to 6 decimal places
  if (Math.abs(value) < 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }

  // For values less than 1000, show 2 decimal places
  if (Math.abs(value) < 1000) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // For values >= 1000, use compact notation with 2 decimal places
  return value.toLocaleString("en-US", {
    notation: "compact",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount));
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const formatError = (
  error: unknown = "Sorry, there was an error processing your message. Please try again."
) => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const isAptosLink = (href: string) => {
  return href.startsWith("https://aptos");
};
