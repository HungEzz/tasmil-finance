import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface EmptyPortfolioStateProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function EmptyPortfolioState({
  isLoading,
  onRefresh,
}: EmptyPortfolioStateProps) {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="w-full max-w-7xl mx-auto flex flex-col space-y-6 px-4 sm:px-6 py-8">
        <div className="flex flex-1 items-center justify-center min-h-[300px]">
          <div className="text-center w-full ">
            {/* <Wallet className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 text-muted-foreground" /> */}
            <Image
              src="/images/empty-wallet.png"
              alt="no-wallet"
              width={100}
              height={100}
              className="mx-auto mb-4"
            />
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Empty Portfolio
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              No tokens found in your wallet
            </p>
            <div className="mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="gap-2 border-primary/20 hover:border-primary/40 text-primary hover:bg-primary/10 w-full max-w-[160px] sm:max-w-fit"
              >
                <RefreshCw
                  className={cn("w-4 h-4", isLoading && "animate-spin")}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
