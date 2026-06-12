"use client";

import { useMemo, useState } from "react";
import { TokenData } from "@/types/portfolio";
import { getSortableValue, getSortIcon } from "./helpers";
import { TokenTableRow } from "./token-table-row";
import { Skeleton } from "@/components/ui/skeleton";

interface SortConfig {
  field: "name" | "price" | "amount";
  direction: "asc" | "desc";
}

interface TableColumn {
  key: SortConfig["field"];
  label: string;
  align: "left" | "right";
  sortable: boolean;
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: "name", label: "Token", align: "left", sortable: true },
  { key: "price", label: "Price / 24h Change", align: "right", sortable: true },
  { key: "amount", label: "Holdings / Value", align: "right", sortable: true },
];

function TokenBreakdown({ tokens }: { tokens: TokenData[] }) {
  const [isLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    direction: "asc",
  });

  const filteredAndSortedTokens = useMemo(() => {
    return [...tokens].sort((a, b) => {
      const aValue = getSortableValue(a, sortConfig.field);
      const bValue = getSortableValue(b, sortConfig.field);

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const comparison = (aValue as number) - (bValue as number);
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [sortConfig, tokens]);

  function handleSort(field: SortConfig["field"]) {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function renderTableHeader() {
    return (
      <thead>
        <tr className="border-b border-gray-700">
          {TABLE_COLUMNS.map((column) => (
            <th
              key={column.key}
              className={`py-3 px-2 text-sm font-medium text-gray-400 ${
                column.align === "right" ? "text-right" : "text-left"
              } ${
                column.sortable
                  ? "cursor-pointer hover:text-gray-300 transition-colors"
                  : ""
              }`}
              onClick={
                column.sortable ? () => handleSort(column.key) : undefined
              }
            >
              <div
                className={`flex items-center gap-1 ${
                  column.align === "right" ? "justify-end" : ""
                }`}
              >
                {column.label}
                {column.sortable &&
                  getSortIcon(
                    column.key,
                    sortConfig.field,
                    sortConfig.direction
                  )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  }

  function renderTableBody() {
    if (isLoading) {
      return (
        <tbody>
          {Array.from({ length: 5 }).map((_, index) => (
            <tr key={index} className="border-b border-gray-800">
              <td className="py-3 px-2" colSpan={TABLE_COLUMNS.length}>
                <Skeleton className="h-12 w-full" />
              </td>
            </tr>
          ))}
        </tbody>
      );
    }

    return (
      <tbody>
        {filteredAndSortedTokens.map((token) => (
          <TokenTableRow
            key={token.name}
            token={token}
            sortField={sortConfig.field}
          />
        ))}
      </tbody>
    );
  }

  return (
    <div className="w-full space-y-4">
      <h1 className="text-2xl font-bold">Token Breakdown</h1>
      <p className="text-base text-gray-400 mb-4">
        Click on any token to view it on Aptos Explorer
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {renderTableHeader()}
          {renderTableBody()}
        </table>
      </div>

      {!isLoading && filteredAndSortedTokens.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No tokens found with the selected filter.
        </div>
      )}
    </div>
  );
}

export default TokenBreakdown;
