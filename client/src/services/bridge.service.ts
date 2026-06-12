import { z } from "zod";

const bridgeQuoteSchema = z.object({
  tokenA: z.string().min(1, "tokenA is required"),
  tokenB: z.string().min(1, "tokenB is required"),
  amount: z.string().min(1, "amount is required"),
  srcChainKey: z.string().min(1, "srcChainKey is required"),
  dstChainKey: z.string().min(1, "dstChainKey is required"),
  dstAddress: z.string().min(1, "dstAddress is required"),
  user_address: z.string().min(1, "user_address is required"),
});

const bridgeQuoteStepTransactionSchema = z.object({
  type: z.string(),
  encoding: z.string(),
  data: z.string(),
});

const bridgeQuoteStepSchema = z.object({
  type: z.string(),
  sender: z.string(),
  chainKey: z.string(),
  transaction: bridgeQuoteStepTransactionSchema,
});

const bridgeQuoteFeeSchema = z.object({
  token: z.string(),
  chainKey: z.string(),
  amount: z.string(),
  type: z.string(),
});

const bridgeQuoteDurationSchema = z.object({
  estimated: z.number(),
});

const bridgeQuoteSchemaFull = z.object({
  route: z.string(),
  error: z.string().nullable(),
  srcAmount: z.string(),
  dstAmount: z.string(),
  srcAmountMax: z.string(),
  dstAmountMin: z.string(),
  srcToken: z.string(),
  dstToken: z.string(),
  srcAddress: z.string(),
  dstAddress: z.string(),
  srcChainKey: z.string(),
  dstChainKey: z.string(),
  dstNativeAmount: z.string(),
  duration: bridgeQuoteDurationSchema,
  fees: z.array(bridgeQuoteFeeSchema),
  steps: z.array(bridgeQuoteStepSchema),
});

const bridgeExecuteSchema = z.object({
  quote: bridgeQuoteSchemaFull,
  user_address: z.string().min(1, "user_address is required"),
});

export interface BridgeQuoteRequest {
  tokenA: string;
  tokenB: string;
  amount: string;
  srcChainKey: string;
  dstChainKey: string;
  dstAddress: string;
  user_address: string;
}

export interface BridgeQuoteFee {
  token: string;
  chainKey: string;
  amount: string;
  type: string;
}

export interface BridgeQuoteDuration {
  estimated: number;
}

export interface BridgeQuoteStepTransaction {
  type: string;
  encoding: string;
  data: string;
}

export interface BridgeQuoteStep {
  type: string;
  sender: string;
  chainKey: string;
  transaction: BridgeQuoteStepTransaction;
}

export interface BridgeQuoteData {
  route: string;
  error: string | null;
  srcAmount: string;
  dstAmount: string;
  srcAmountMax: string;
  dstAmountMin: string;
  srcToken: string;
  dstToken: string;
  srcAddress: string;
  dstAddress: string;
  srcChainKey: string;
  dstChainKey: string;
  dstNativeAmount: string;
  duration: BridgeQuoteDuration;
  fees: BridgeQuoteFee[];
  steps: BridgeQuoteStep[];
}

export interface BridgeQuoteResponse {
  message: string;
  data: {
    quote: BridgeQuoteData;
    decimalsSrcToken: number;
    decimalsDstToken: number;
    symbolSrcToken: string;
    symbolDstToken: string;
  } | null;
  error?: string;
}

export interface BridgeExecuteRequest {
  quote: BridgeQuoteData;
  user_address: string;
}

function getApiUrl(path = ""): string {
  return `/api/chat/bridge${path}`;
}

async function fetchSwapApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });
  let data: T;
  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid JSON response from swap API");
  }
  if (!response.ok)
    throw new Error(
      (data as unknown as { error: string })?.error || `Swap API request failed: ${response.statusText}`,
    );
  return data;
}

export async function getBridgeQuote(
  params: BridgeQuoteRequest,
): Promise<BridgeQuoteResponse> {
  const parseResult = bridgeQuoteSchema.safeParse(params);
  if (!parseResult.success)
    return {
      message: "Invalid request",
      data: null,
      error: JSON.stringify(parseResult.error.flatten()),
    };

  try {
    const backendRequest = {
      tokenA: parseResult.data.tokenA,
      tokenB: parseResult.data.tokenB,
      amount: parseResult.data.amount,
      srcChainKey: parseResult.data.srcChainKey,
      dstChainKey: parseResult.data.dstChainKey,
      dstAddress: parseResult.data.dstAddress,
      user_address: parseResult.data.user_address,
    };

    return await fetchSwapApi<BridgeQuoteResponse>("", {
      method: "POST",
      body: JSON.stringify(backendRequest),
    });
  } catch (error) {
    return {
      message: "Failed to fetch bridge quote",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function executeBridge(params: BridgeExecuteRequest): Promise<{
  message: string;
  data: {
    transactionHash?: string | { hash: string; error?: string };
    error?: string;
  } | null;
  error?: string;
}> {
  const parseResult = bridgeExecuteSchema.safeParse(params);
  if (!parseResult.success)
    return {
      message: "Invalid request",
      data: null,
      error: JSON.stringify(parseResult.error.flatten()),
    };

  try {
    const backendRequest = {
      quote: parseResult.data.quote,
      user_address: parseResult.data.user_address,
    };

    return await fetchSwapApi<{
      message: string;
      data: {
        transactionHash: string | { hash: string; error?: string };
      } | null;
    }>("/execute", {
      method: "POST",
      body: JSON.stringify(backendRequest),
    });
  } catch (error) {
    return {
      message: "Failed to execute bridge",
      data: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
