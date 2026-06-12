import Image from "next/image";

export function NoWalletState() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xs mx-auto text-center">
        <Image
          src="/images/empty-wallet.png"
          alt="no-wallet"
          width={100}
          height={100}
          className="mx-auto mb-4"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
          No Wallet Connected
        </h2>
        <p className="text-base text-muted-foreground">
          Please connect your wallet to view your portfolio.
        </p>
      </div>
    </div>
  );
}
