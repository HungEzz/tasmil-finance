import { NextResponse } from "next/server";
import { API_BASE_URL } from "@/constants/routes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get("symbols");
  const period = searchParams.get("period") || "1M";

  if (!symbols) {
    return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
  }

  // Split and take the first symbol since backend's getPriceHistory takes a single symbol
  const symbol = symbols.split(",")[0].trim();

  try {
    const backendUrl = `${API_BASE_URL}/dashboard/price-history?symbol=${symbol}&period=${period}`;
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      console.warn(`Backend returned status ${response.status} for get-history of ${symbol}. Returning fallback mock data.`);
      
      // Fallback: generate mock data
      const mockPoints = [];
      const mockPrice = symbol.includes("BTC") 
        ? 63000 
        : symbol.includes("ETH") 
        ? 3400 
        : symbol.includes("SOL") 
        ? 150 
        : symbol.includes("APT") 
        ? 8 
        : 10;
      const now = Date.now();
      for (let i = 29; i >= 0; i--) {
        const timestamp = now - i * 24 * 60 * 60 * 1000;
        const randomChange = (Math.random() - 0.5) * 6; // random fluctuations
        mockPoints.push({
          timestamp,
          price: mockPrice * (1 + randomChange / 100),
        });
      }

      return NextResponse.json({
        [symbol]: mockPoints,
      });
    }
    
    const data = await response.json();
    
    // Transform the backend response to match client expectation:
    // data.data has [{ date, open, high, low, close, volume, change, changePercent }]
    // client expects data[symbol] to be [{ timestamp, price }]
    const historicalPoints = Array.isArray(data.data)
      ? data.data.map((item: any) => ({
          timestamp: new Date(item.date).getTime(),
          price: item.close,
        }))
      : [];

    const result = {
      [symbol]: historicalPoints,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in dashboard get-history API proxy:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
