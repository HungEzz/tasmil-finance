export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export interface SwapQuote {
  amountIn: string;
  amountInUsd: string;
  amountOut: string;
  amountOutUsd: string;
  gasUsd: string;
  sourceToken: Token;
  destinationToken: Token;
}
