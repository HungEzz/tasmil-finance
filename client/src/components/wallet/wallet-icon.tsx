import Image from "next/image";

interface WalletIconProps {
  walletName: string;
  className?: string;
}

export function WalletIcon({ walletName, className = "h-8 w-8" }: WalletIconProps) {
  const getWalletConfig = (name: string) => {
    const lowerName = name.toLowerCase();

    switch (lowerName) {
      case "petra":
        return {
          src: "/wallet/petra.png",
          alt: "Petra Wallet",
          fallbackColor: "bg-gradient-to-br from-purple-500 to-purple-600"
        };
      case "pontem wallet":
      case "pontem":
        return {
          src: "/wallet/pontem.png",
          alt: "Pontem Wallet",
          fallbackColor: "bg-gradient-to-br from-blue-500 to-blue-600"
        };
      case "okx wallet":
      case "okx":
        return {
          src: "/wallet/okx.png",
          alt: "OKX Wallet",
          fallbackColor: "bg-gradient-to-br from-green-500 to-green-600"
        };
      case "nightly":
        return {
          src: "/wallet/nightly.png",
          alt: "Nightly Wallet",
          fallbackColor: "bg-gradient-to-br from-indigo-500 to-indigo-600"
        };
      default:
        return {
          src: null,
          alt: `${walletName} Wallet`,
          fallbackColor: "bg-gradient-to-br from-gray-500 to-gray-600"
        };
    }
  };

  const walletConfig = getWalletConfig(walletName);

  if (!walletConfig.src) {
    // Fallback to gradient background for unknown wallets
    return (
      <div className={`${className} ${walletConfig.fallbackColor} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
        {walletName.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <Image
        src={walletConfig.src}
        alt={walletConfig.alt}
        fill
        className="object-contain rounded-full"
        sizes="(max-width: 768px) 32px, 32px"
      />
    </div>
  );
}
