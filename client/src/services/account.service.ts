export class AccountService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error || `API request failed: ${response.statusText}`);
      throw error;
    }

    return data;
  }

  static async checkUser(address: string) {
    if (!address) {
      throw new Error("Address is required");
    }

    return this.request(`/api/account/check-user?address=${address}`);
  }

  static async generateTasmilWallet(address: string) {
    if (!address) {
      throw new Error("Address is required");
    }

    return this.request("/api/account/generate-tasmil-wallet", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  }
}
