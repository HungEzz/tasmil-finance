export enum ACTION_TYPE {
  USER = "user",
  UNKNOWN = "unknown",
  BRIDGE = "bridge",
  SWAP = "swap",
  PRE_SWAP = "pre_swap",
  LIQUIDITY = "liquidity",
  STAKING = "staking",
  UNSTAKING = "unstaking",
  BORROW = "borrow",
  SUPPLY = "supply",
  REPAY = "repay",
  WITHDRAW = "withdraw",
  CLAIM_REWARD = "claim_reward",
  PLACE_LIMIT_ORDER = "place_limit_order",
  PLACE_MARKET_ORDER = "place_market_order",
  REMOVE_LIQUIDITY = "remove_liquidity",
  HELP = "help",
}

export interface ChatResponse {
  id: string;
  timestamp: Date;
  message: string;
  data?: { [key: string]: string | boolean };
  intent?: {
    action: ACTION_TYPE;
    confidence?: number;
    context?: string;
    missingFields?: string[];
    params?: { [key: string]: string };
  };
}

export interface ChatMessage extends ChatResponse {
  actionType: ACTION_TYPE;
}
