import { API_BASE_URL } from "@/constants/routes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { address } = (await request.json()) as { address: string };

    const response = await fetch(`${API_BASE_URL}/accounts/generate-tasmil-wallet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ address }),
      credentials: "include",
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating tasmil wallet:", error);
    return NextResponse.json({ error: "Failed to generate tasmil wallet" }, { status: 500 });
  }
}
