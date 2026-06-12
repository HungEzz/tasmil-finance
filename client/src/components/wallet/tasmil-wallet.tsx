"use client";

import { AccountService } from "@/services/account.service";
import { useWalletStore } from "@/store/use-wallet";
import { truncateAddress } from "@aptos-labs/ts-sdk";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PrivateKeyDialog } from "@/components/wallet/dialogs/private-key";
import { ButtonEllipsis } from "@/components/wallet/menu/button-ellipsis";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Typography } from "@/components/ui/typography";

interface TasmilWalletResponse {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    tasmilAddress: string;
    privateKey: string;
  };
}

function TasmilWallet() {
  const { account, tasmilAddress, setTasmilAddress, signing, connected } =
    useWalletStore();
  const { account: connectedWallet } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [isPKDialogOpen, setIsPKDialogOpen] = useState<boolean>(false);

  const createInternalWallet = useCallback(async () => {
    if (!account || !connectedWallet || signing) return;

    setIsLoading(true);
    try {
      const response = (await AccountService.generateTasmilWallet(
        account
      )) as TasmilWalletResponse;

      if (response.success && response.data) {
        setTasmilAddress(response?.data?.tasmilAddress || "");
        setPrivateKey(response?.data?.privateKey || "");
        setIsPKDialogOpen(true);
        toast.success("Tasmil Wallet created successfully!");
      } else {
        toast.error(response.message || "Failed to create Tasmil Wallet");
      }
    } catch (error) {
      console.error("Error creating tasmil wallet:", error);
      toast.error("Failed to create Tasmil Wallet");
    } finally {
      setIsLoading(false);
    }
  }, [account, connectedWallet, signing, setTasmilAddress]);

  if (!account || !connectedWallet || !connected) return null;

  if (signing) {
    return (
      <div className="w-auto flex flex-col gap-2 items-center justify-center rounded-2xl p-3 mb-4 border border-white/5">
        <Loader2 className="w-4 h-4 animate-spin" />
        <p className="text-center text-sm text-white/70">
          Connecting wallet...
        </p>
      </div>
    );
  }

  return (
    <div className=" w-full flex flex-col gap-2 items-center rounded-lg  glass border">
      {tasmilAddress ? (
        <div className="w-full rounded-lg p-3 ">
          <div>
            <div className="flex justify-between items-center">
              <p className="text-sm">Tasmil Wallet</p>
              <ButtonEllipsis address={tasmilAddress || ""} />
            </div>
            <Typography gradient={true} className="text-sm font-semibold mt-1">
              {truncateAddress(tasmilAddress || "")}
            </Typography>
          </div>
        </div>
      ) : (
        <div className="w-full rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm mb-3">
              You haven&apos;t created a Tasmil Wallet yet.
            </p>
            <Button
              onClick={createInternalWallet}
              className="w-full h-9"
              disabled={isLoading}
              variant="secondary"
            >
              <Typography className="text-sm">
                {isLoading ? "Creating..." : "Create Tasmil Wallet"}
              </Typography>
            </Button>
          </div>
        </div>
      )}
      <PrivateKeyDialog
        isOpen={isPKDialogOpen}
        onClose={() => setIsPKDialogOpen(false)}
        privateKey={privateKey}
      />
    </div>
  );
}

export default TasmilWallet;
