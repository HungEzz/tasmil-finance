export class AuthService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(
        data.error || `API request failed: ${response.statusText}`,
      );
      throw error;
    }

    return data;
  }

  static async getNonce(address: string) {
    if (!address) {
      throw new Error("Address is required");
    }

    return this.request(`/api/auth/get-nonce?address=${address}`);
  }

  static async verifySignature(params: {
    walletAddress: string;
    publicKey: string;
    signature: string;
    message: string;
    nonce: string;
  }): Promise<{ success: boolean; message: string; token: string }> {
    if (
      !params.walletAddress ||
      !params.publicKey ||
      !params.signature ||
      !params.message ||
      !params.nonce
    ) {
      throw new Error("Missing required parameters");
    }

    if (!params.message.includes(params.nonce)) {
      throw new Error("Message does not contain nonce");
    }

    return this.request("/api/auth/verify-signature", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  static async logout() {
    return this.request("/api/auth/logout", {
      method: "POST",
    });
  }
}
