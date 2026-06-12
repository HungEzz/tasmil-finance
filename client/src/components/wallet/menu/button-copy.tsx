import { Copy } from "lucide-react";
import React, { useCallback } from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ButtonCopyProps {
  address: string | undefined;
}

const ButtonCopy = ({ address }: ButtonCopyProps) => {
  const copyAddress = useCallback(async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Copied wallet address to clipboard.");
    } catch {
      toast.error("Failed to copy wallet address.");
    }
  }, [address, toast]);

  return (
    <DropdownMenuItem onClick={copyAddress}>
      <Copy className="w-4 h-4 " />
      Copy Address
    </DropdownMenuItem>
  );
};

export default ButtonCopy;
