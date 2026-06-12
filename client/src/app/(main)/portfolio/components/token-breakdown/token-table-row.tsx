import { TokenData } from "@/types/portfolio";
import { TOKENS } from "@/constants/token";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

export interface TokenTableRowProps {
  token: TokenData;
  sortField: string;
}

export function TokenTableRow({ token }: TokenTableRowProps) {
  const tokenInfo = TOKENS[token.symbol];

  console.log("tokenInfo: ", tokenInfo);
  console.log("token: ", token);

  const formatPrice = (price: number) => {
    if (price === 0) return "N/A";
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatAmount = (amount: number) => {
    if (amount === 0) return "0";
    if (amount < 0.01) return amount.toFixed(8);
    if (amount < 1) return amount.toFixed(6);
    return amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatChange = (change: number) => {
    if (change === 0) return "0.00%";
    const sign = change > 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-400";
    if (change < 0) return "text-red-400";
    return "text-gray-400";
  };

  const handleRowClick = () => {
    // Navigate to Aptos Explorer for the token
    const explorerUrl = `https://explorer.aptoslabs.com/coin/${
      tokenInfo?.moveAddress || token.name
    }?network=mainnet`;
    window.open(explorerUrl, "_blank");
  };

  return (
    <tr
      className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer group"
      onClick={handleRowClick}
    >
      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          {tokenInfo?.image && (
            <Image
              src={tokenInfo.image}
              alt={token.symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              width={32}
              height={32}
            />
          )}
          <div className="flex flex-col ">
            <div className="flex items-center gap-2 group-hover:text-muted">
              <span className="font-medium">{token.symbol}</span>
              <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xs text-gray-500">
              {tokenInfo?.name || token.name}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <div className="flex flex-col items-end">
          <span className="font-mono">{formatPrice(token.price)}</span>
          <span className={`text-xs ${getChangeColor(token.change24h)}`}>
            {formatChange(token.change24h)}
          </span>
        </div>
      </td>
      <td className="py-3 px-2 text-right">
        <div className="flex flex-col items-end">
          <span className="text-gray-400">{formatAmount(token.amount)}</span>
          <span className="text-xs text-gray-500 font-mono">
            {token.value > 0
              ? `$${token.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "N/A"}
          </span>
        </div>
      </td>
    </tr>
  );
}
