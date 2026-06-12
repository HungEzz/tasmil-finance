import { ExternalLink } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface ButtonExplorerProps {
  address: string;
}

function getExplorerUrl(address: string, networkName?: string): string | null {
  if (!address || !networkName) return null;
  return `https://explorer.aptoslabs.com/account/${address}?network=${networkName.toLowerCase()}`;
}

function ButtonExplorer({ address }: ButtonExplorerProps) {
  const { network } = useWallet();

  function handleViewExplorer() {
    const url = getExplorerUrl(address, network?.name);
    if (!url) return;
    window.open(url, "_blank");
  }

  return (
    <DropdownMenuItem onClick={handleViewExplorer}>
      <ExternalLink className="w-4 h-4 " />
      View Explorer
    </DropdownMenuItem>
  );
}

export default ButtonExplorer;
