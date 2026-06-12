"use client";

import { Button } from "@/components/ui/button-v2";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import { AccountService } from "@/services/account.service";
import { useWalletStore } from "@/store/use-wallet";
import { truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Loader2, LogOut, User, Wallet } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import ButtonCopy from "@/components/wallet/menu/button-copy";
import { WalletIcon } from "@/components/wallet/wallet-icon";
import { Typography } from "@/components/ui/typography";

declare global {
  interface Window {
    aptos?: any;
    okxwallet?: {
      aptos?: {
        account: () => Promise<{ address?: string; publicKey?: string }>;
        getAccount?: () => Promise<{ address?: string; publicKey?: string }>;
      };
    };
    pontem?: {
      account: () => Promise<string | { address?: string; publicKey?: string }>;
      publicKey: () => Promise<string>;
    };
  }
}

interface ConnectButtonProps {
  label?: string;
  className?: string;
}

interface UserResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    tasmilAddress: string;
  };
}

interface WalletAccount {
  address: string;
  publicKey: string;
}

const AUTH_CANCELLED_KEY = "wallet_auth_cancelled";

// Helper functions
const getWalletAccount = async (walletName: string): Promise<WalletAccount> => {
  const walletNameLower = walletName.toLowerCase();

  if (walletNameLower.includes("okx")) {
    return getOKXWalletAccount();
  } else if (walletNameLower.includes("pontem")) {
    return getPontemWalletAccount();
  } else {
    return getStandardWalletAccount();
  }
};

const getOKXWalletAccount = async (): Promise<WalletAccount> => {
  if (typeof window === "undefined" || !window.okxwallet?.aptos) {
    throw new Error(
      "OKX wallet not found. Please install OKX wallet extension."
    );
  }

  try {
    const account = await window.okxwallet.aptos.account();
    return normalizeAccount(account);
  } catch (error) {
    console.error("Failed to get OKX wallet account:", error);

    // Try fallback method
    if (window.okxwallet?.aptos?.getAccount) {
      try {
        const account = await window.okxwallet.aptos.getAccount();
        return normalizeAccount(account);
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
      }
    }

    throw new Error(
      "Unable to access OKX wallet account. Please ensure OKX wallet is unlocked."
    );
  }
};

const getPontemWalletAccount = async (): Promise<WalletAccount> => {
  if (typeof window === "undefined" || !window.pontem) {
    throw new Error(
      "Pontem wallet not found. Please install Pontem wallet extension."
    );
  }

  try {
    const [address, publicKey] = await Promise.all([
      window.pontem.account(),
      window.pontem.publicKey(),
    ]);

    return {
      address: typeof address === "string" ? address : address.address || "",
      publicKey: publicKey || "",
    };
  } catch (error) {
    console.error("Failed to get Pontem wallet account:", error);
    throw new Error(
      "Unable to access Pontem wallet account. Please ensure Pontem wallet is unlocked."
    );
  }
};

const getStandardWalletAccount = async (): Promise<WalletAccount> => {
  if (typeof window === "undefined" || !window.aptos) {
    throw new Error(
      "Aptos wallet not found. Please install a supported wallet extension."
    );
  }

  try {
    const account = await window.aptos.account();
    return normalizeAccount(account);
  } catch (error) {
    console.error("Failed to get standard wallet account:", error);
    throw new Error("Unable to access wallet account. Please try again.");
  }
};

const normalizeAccount = (account: any): WalletAccount => {
  if (typeof account === "string") {
    return { address: account, publicKey: "" };
  }

  return {
    address: account?.address || "",
    publicKey: account?.publicKey || "",
  };
};

const authenticateWallet = async (
  walletAccount: WalletAccount,
  signMessage: (args: { message: string; nonce: string }) => Promise<any>
) => {
  console.log("walletAccount inside authenticateWallet:", walletAccount);
  // Get nonce
  const { nonce, message } = (await AuthService.getNonce(
    walletAccount.address
  )) as {
    nonce: string;
    message: string;
  };

  if (!nonce) throw new Error("Failed to get nonce");

  // Sign message
  const signature = await signMessage({ message, nonce });
  console.log("signature returned from signMessage:", signature);
  if (!signature) throw new Error("User rejected signature");

  console.log("Calling verifySignature with:", {
    walletAddress: walletAccount.address,
    publicKey: walletAccount.publicKey,
    signature: (signature.signature as any).signature || String(signature.signature),
    signatureType: typeof signature.signature,
    signatureStringVal: String(signature.signature),
    message: signature.fullMessage,
    nonce,
  });

  // Verify signature
  const response = await AuthService.verifySignature({
    walletAddress: walletAccount.address,
    publicKey: walletAccount.publicKey,
    signature:
      (signature.signature as any).signature || String(signature.signature),
    message: signature.fullMessage,
    nonce,
  });

  if (!response.success) throw new Error("Signature verification failed");

  return response;
};

const checkUserAccount = async (address: string): Promise<string | null> => {
  try {
    const user = (await AccountService.checkUser(address)) as UserResponse;
    return user.success && user.data ? user.data.tasmilAddress : null;
  } catch (error) {
    console.error("Error checking user:", error);
    return null;
  }
};

export default function ConnectButton({
  label = "Connect Aptos Wallet",
  className,
}: ConnectButtonProps) {
  const {
    account: walletAccount,
    connected: walletConnected,
    disconnect,
    connect,
    signMessage,
    wallets,
  } = useWallet();

  // Ref to prevent duplicate authentication attempts
  const isAuthenticatingRef = useRef(false);

  const {
    setWalletState,
    setSigning,
    signing,
    connected: verified,
    account: storedAccount,
    reset: resetWalletState,
  } = useWalletStore();

  // Automatically trigger authentication when wallet is connected but not yet verified
  useEffect(() => {
    let active = true;

    const autoAuthenticate = async () => {
      // Guard: skip if already authenticating, or conditions not met
      if (
        isAuthenticatingRef.current ||
        !walletConnected ||
        !walletAccount ||
        verified ||
        sessionStorage.getItem(AUTH_CANCELLED_KEY) === "true"
      ) {
        return;
      }

      // Lock to prevent duplicate runs
      isAuthenticatingRef.current = true;

      try {
        setSigning(true);

        // Wait for wallet adapter internal state synchronization
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!active) return;

        // Extract publicKey correctly - it's a PublicKey object, use toString()
        let publicKeyHex = "";
        if (walletAccount.publicKey) {
          if (typeof walletAccount.publicKey === "string") {
            publicKeyHex = walletAccount.publicKey;
          } else if (typeof walletAccount.publicKey.toString === "function") {
            // PublicKey class from @aptos-labs/wallet-adapter-react
            publicKeyHex = walletAccount.publicKey.toString();
          }
        }

        // Extract address correctly - it's an AccountAddress object in modern adapter, use toString()
        let addressStr = "";
        if (walletAccount.address) {
          if (typeof walletAccount.address === "string") {
            addressStr = walletAccount.address;
          } else if (typeof walletAccount.address.toString === "function") {
            addressStr = walletAccount.address.toString();
          }
        }

        const accountData = {
          address: addressStr,
          publicKey: publicKeyHex,
        };

        console.log("Extracted accountData for authentication:", accountData);

        if (!accountData.address) {
          throw new Error("No account found");
        }

        if (!accountData.publicKey) {
          throw new Error("Could not extract public key from wallet");
        }

        // Authenticate wallet
        const authResponse = await authenticateWallet(
          accountData,
          signMessage
        );

        if (!active) return;

        // Check user account
        const tasmilAddress = await checkUserAccount(accountData.address);

        if (!active) return;

        // Success
        sessionStorage.removeItem(AUTH_CANCELLED_KEY);
        setWalletState({
          connected: true,
          account: accountData.address,
          tasmilAddress,
        });

        toast.success("Wallet Connected", {
          description: authResponse?.message,
        });
      } catch (error: any) {
        if (!active) return;
        console.error("Authentication failed:", error);
        const isCancelled =
          error.message?.includes("rejected") || error.code === 4001;

        if (isCancelled) {
          sessionStorage.setItem(AUTH_CANCELLED_KEY, "true");
        } else {
          const errorMessage =
            typeof error === "string"
              ? error
              : error?.message || "Unknown error occurred";
          toast.error("Authentication Failed", { description: errorMessage });
        }

        // Cleanup and reset on error
        resetWalletState();
        try {
          if (walletConnected) {
            await disconnect();
          }
        } catch (err) {
          console.error("Failed to disconnect:", err);
        }
      } finally {
        if (active) {
          setSigning(false);
          isAuthenticatingRef.current = false;
        } else {
          isAuthenticatingRef.current = false;
        }
      }
    };

    autoAuthenticate();

    return () => {
      active = false;
    };
  }, [
    walletConnected,
    walletAccount,
    verified,
    signMessage,
    setWalletState,
    setSigning,
    resetWalletState,
    disconnect,
  ]);

  const handleConnect = useCallback(
    async (walletName: string) => {
      try {
        setSigning(true);
        console.log(`Connecting to ${walletName}...`);

        // Connect wallet
        await connect(walletName);
        console.log(`Connected to ${walletName}`);
      } catch (error: any) {
        console.error("Connection failed:", error);
        toast.error("Connection Failed", {
          description: error?.message || "Unknown error occurred",
        });
        resetWalletState();
      } finally {
        setSigning(false);
      }
    },
    [connect, setSigning, resetWalletState]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      if (walletConnected) {
        await disconnect();
      }
      resetWalletState();
      await AuthService.logout();
      toast.success("Wallet Disconnected");
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Failed to disconnect");
    }
  }, [walletConnected, disconnect, resetWalletState]);

  const renderTitle = (title: string) => label.trim().length > 0 && title;

  // Render states
  if (walletConnected && !verified) {
    return (
      <Button variant="secondary" className={cn("gap-2", className)} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        <Typography className="text-sm">
          {renderTitle("Verifying...")}
        </Typography>
      </Button>
    );
  }

  if (walletConnected && verified && storedAccount) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="gradient"
            className={cn("gap-2 text-black h-9", className)}
          >
            <Wallet className="h-4 w-4 font-semibold" fontWeight={700} />
            <Typography className="text-xs text-embossed font-semibold">
              {walletAccount?.ansName ||
                truncateAddress(storedAccount) ||
                "Unknown"}
            </Typography>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ButtonCopy address={storedAccount} />
          <DropdownMenuItem asChild>
            <a
              href={`https://explorer.aptoslabs.com/account/${storedAccount}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2"
            >
              <User className="h-4 w-4" /> View on Explorer
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleDisconnect} className="gap-2">
            <LogOut className="h-4 w-4" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          className={cn("gap-2", className)}
          disabled={signing}
        >
          {signing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <Typography className="text-sm">
                {renderTitle("Connecting...")}
              </Typography>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <Typography className="text-xs text-embossed">
                {renderTitle(label)}
              </Typography>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        side="bottom"
        className="w-[17rem] p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border shadow-xl rounded-xl"
      >
        <div className="text-base font-semibold text-center mb-4 text-foreground">
          Choose your wallet
        </div>
        {wallets && wallets.length === 0 ? (
          <DropdownMenuItem disabled className="text-center py-3">
            No wallets available
          </DropdownMenuItem>
        ) : (
          <div className="space-y-2">
            {wallets &&
              wallets.map((wallet, index) => (
                <DropdownMenuItem
                  key={`${wallet.name}-${index}`}
                  onSelect={() => {
                    sessionStorage.removeItem(AUTH_CANCELLED_KEY);
                    handleConnect(wallet.name);
                  }}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-accent transition-all duration-200 hover:scale-[1.02]"
                >
                  <WalletIcon walletName={wallet.name} />
                  <span className="font-medium text-foreground">
                    {wallet.name}
                  </span>
                </DropdownMenuItem>
              ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
