import { API_BASE_URL } from "@/constants/routes";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("verify-signature API body:", body);
    const { walletAddress, publicKey, signature, message } = body;

    const response = await fetch(`${API_BASE_URL}/auth/verify-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({
        walletAddress,
        publicKey,
        signature,
        message,
      }),
      credentials: "include",
    });

    const data = await response.json();

    // Lấy Set-Cookie từ backend
    const setCookie = response.headers.get("set-cookie");
    const nextResponse = NextResponse.json(data);

    // Forward Set-Cookie về client
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("Error verifying signature:", error);
    return NextResponse.json({ error: "Failed to verify signature" }, { status: 500 });
  }
}
