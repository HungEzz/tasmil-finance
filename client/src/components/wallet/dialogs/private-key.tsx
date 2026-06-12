"use client";

import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Decrypt } from "@/lib/aptos/descript";
import { truncateAddress } from "@aptos-labs/ts-sdk";

interface PrivateKeyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  privateKey: string | null;
}

export function PrivateKeyDialog({
  isOpen,
  onClose,
  privateKey,
}: PrivateKeyDialogProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleCopy = useCallback(
    async (key: string) => {
      if (!key) return;
      try {
        await navigator.clipboard.writeText(key);
        setHasCopied(true);
        toast.success("Private key copied to clipboard.");
        setTimeout(() => setHasCopied(false), 1200);
      } catch {
        // Optionally handle error here
      }
    },
    [toast]
  );

  if (!privateKey) return null;

  const password = process.env.NEXT_PUBLIC_PASSWORD_ENCRYPT;
  const parsedPrivateKey = JSON.parse(privateKey);

  if (!password) {
    throw new Error("Password is not set");
  }
  const decryptedPrivateKey = Decrypt({
    cipherText: parsedPrivateKey.cipherText,
    password: password,
    saltB64: parsedPrivateKey.salt,
    ivB64: parsedPrivateKey.iv,
  });

  function getMaskedKey(key: string) {
    if (key.length <= 8) return "********";
    return truncateAddress(key);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your Private Key</DialogTitle>
          <DialogDescription>
            This is{" "}
            <span className="font-semibold text-yellow-400/80">
              only show 1 time
            </span>
            . Do not share it with anyone.
          </DialogDescription>
        </DialogHeader>
        <div className="my-4">
          <div className="relative p-4 pr-16 bg-background rounded-md border border-border font-mono text-sm break-all select-all">
            {isVisible
              ? decryptedPrivateKey.prKey
              : getMaskedKey(decryptedPrivateKey.prKey)}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7"
              onClick={() => handleCopy(decryptedPrivateKey.prKey)}
              aria-label={hasCopied ? "Copied" : "Copy private key"}
            >
              {hasCopied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-10 h-7 w-7"
              onClick={() => setIsVisible((v) => !v)}
              aria-label={isVisible ? "Hide private key" : "Show private key"}
              tabIndex={0}
              type="button"
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="p-3 bg-yellow-900/20 rounded-md text-xs">
          <strong>Note:</strong> Please fund your wallet with minimum{" "}
          <span className="text-yellow-400/80 ">0.25 APT</span> to active in
          Aptos network.
        </div>
      </DialogContent>
    </Dialog>
  );
}
