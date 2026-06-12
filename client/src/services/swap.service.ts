import { z } from "zod";

const swapRequestSchema = z.object({
  user_address: z.string().min(1, "User address required"),
  fromToken: z.string().min(1, "From token required"),
  toToken: z.string().min(1, "To token required"),
  fromAmount: z.union([z.string(), z.number()]),
  curveType: z.string().optional(),
  version: z.number().optional(),
});

interface SwapRequest {
  user_address: string;
  fromToken: string;
  toToken: string;
  fromAmount: string | number;
  curveType?: string;
  version?: number;
}

interface SwapResponse {
  message: string;
  data?: unknown;
  error?: string;
}

function getApiUrl(path = ""): string {
  return `/api/chat/swap${path}`;
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
      (data as any)?.error || `Swap API request failed: ${response.statusText}`,
    );
  return data;
}

export async function getPreSwapRate(
  params: SwapRequest,
): Promise<SwapResponse> {
  const parseResult = swapRequestSchema.safeParse(params);
  if (!parseResult.success)
    return {
      message: "Invalid pre-swap request",
      error: JSON.stringify(parseResult.error.flatten()),
    };

  try {
    // Convert to backend DTO format
    const backendRequest = {
      user_address: parseResult.data.user_address,
      fromToken: parseResult.data.fromToken,
      toToken: parseResult.data.toToken,
      fromAmount: Number(parseResult.data.fromAmount),
      toAmount: 0, // For pre-swap, backend will calculate this
      interactiveToken: "from", // Default to "from" side
      curveType: parseResult.data.curveType || "stable",
      version: parseResult.data.version || 0,
      action: "pre_swap",
    };

    return await fetchSwapApi<SwapResponse>("", {
      method: "POST",
      body: JSON.stringify(backendRequest),
    });
  } catch (error) {
    return {
      message: "Failed to fetch pre-swap rate",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function executeSwap(params: SwapRequest): Promise<SwapResponse> {
  const parseResult = swapRequestSchema.safeParse(params);
  if (!parseResult.success)
    return {
      message: "Invalid swap request",
      error: JSON.stringify(parseResult.error.flatten()),
    };

  try {
    // Convert to backend DTO format
    const backendRequest = {
      user_address: parseResult.data.user_address,
      fromToken: parseResult.data.fromToken,
      toToken: parseResult.data.toToken,
      fromAmount: Number(parseResult.data.fromAmount),
      toAmount: 0, // For swap execution, this will be calculated
      interactiveToken: "from", // Default to "from" side
      curveType: parseResult.data.curveType || "stable",
      version: parseResult.data.version || 0,
      action: "swap",
    };

    return await fetchSwapApi<SwapResponse>("", {
      method: "POST",
      body: JSON.stringify(backendRequest),
    });
  } catch (error) {
    return {
      message: "Swap execution failed",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
