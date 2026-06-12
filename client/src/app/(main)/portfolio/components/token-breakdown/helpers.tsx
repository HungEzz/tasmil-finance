import React from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { TokenData } from "@/types/portfolio";

export type SortField = "name" | "price" | "amount";

export type SortDirection = "asc" | "desc";

// Get sortable value for a token
export function getSortableValue(
  token: TokenData,
  field: SortField
): number | string {
  const fieldMappers: Record<SortField, (token: TokenData) => number | string> =
    {
      name: (token) => token.symbol.toLowerCase(),
      price: (token) => token.price,
      amount: (token) => token.amount,
    };

  return fieldMappers[field]?.(token) ?? 0;
}

// Get color for change value
export function getChangeColor(change: number): string {
  if (change > 0) return "text-green-500";
  if (change < 0) return "text-red-500";
  return "text-gray-500";
}

// Format change value
export function formatChange(change: number): string {
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}%`;
}

// Get sort icon for table headers
export function getSortIcon(
  field: SortField,
  sortField: SortField,
  sortDirection: SortDirection
): React.ReactNode {
  if (sortField !== field) {
    return;
  }
  if (sortDirection === "asc") {
    return <ArrowUpIcon className="w-4 h-4" />;
  }
  return <ArrowDownIcon className="w-4 h-4" />;
}
