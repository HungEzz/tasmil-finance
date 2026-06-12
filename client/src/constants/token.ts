export interface TokenInfo {
  symbol: string;
  name: string;
  image?: string;
  moveAddress?: string;
  hexAddress?: string;
  decimals: number;
}

export const TOKENS: Record<string, TokenInfo> = {
  APT: {
    name: "APT",
    symbol: "APT",
    moveAddress: "0x1::aptos_coin::AptosCoin",
    image: "https://assets.panora.exchange/tokens/aptos/APT.svg",
    decimals: 8,
  },
  USDT: {
    name: "USDT",
    symbol: "USDT",
    moveAddress: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT",
    image: "https://assets.panora.exchange/tokens/aptos/lzUSDT.png",
    decimals: 6,
  },
  USDC: {
    name: "USDC",
    symbol: "USDC",
    hexAddress: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
    image: "https://assets.panora.exchange/tokens/aptos/USDC.svg",
    decimals: 6,
  },
  ALT: {
    name: "ALT",
    symbol: "ALT",
    moveAddress:
      "0xd0b4efb4be7c3508d9a26a9b5405cf9f860d0b9e5fe2f498b90e68b8d2cedd3e::aptos_launch_token::AptosLaunchToken",
    image: "https://assets.panora.exchange/tokens/aptos/ALT.png",
    decimals: 8,
  },
  StakedThalaAPT: {
    name: "Staked Thala APT",
    symbol: "stAPT",
    moveAddress:
      "0x111ae3e5bc816a5e63c2da97d0aa3886519e0cd5e4b046659fa35796bd11542a::stapt_token::StakedApt",
    image: "https://assets.panora.exchange/tokens/aptos/STHAPT.png",
    decimals: 6,
  },
  ThalaAPT: {
    name: "Thala",
    symbol: "THALA",
    moveAddress:
      "0xfaf4e633ae9eb31366c9ca24214231760926576c7b625313b3688b5e900731f6::staking::ThalaAPT",
    image: "https://assets.panora.exchange/tokens/aptos/THAPT.png",
    decimals: 8,
  },
  MOJO: {
    name: "MOJO",
    symbol: "MOJO",
    moveAddress: "0x881ac202b1f1e6ad4efcff7a1d0579411533f2502417a19211cfc49751ddb5f4::coin::MOJO",
    image: "https://assets.panora.exchange/tokens/aptos/MOJO.svg",
    decimals: 8,
  },
  LSD: {
    name: "LSD",
    symbol: "LSD",
    moveAddress: "0x53a30a6e5936c0a4c5140daed34de39d17ca7fcae08f947c02e979cef98a3719::coin::LSD",
    image: "https://assets.panora.exchange/tokens/aptos/LSD.png",
    decimals: 8,
  },
  HAIR: {
    name: "HAIR",
    symbol: "HAIR",
    moveAddress:
      "0x96baeee6d7a4a8cd712144d1225cfcb6c26d0c6fefd463bd77a878e4526c7411::hair_coin::HairCoin",
    image: "https://assets.panora.exchange/tokens/aptos/HAIR.png",
    decimals: 8,
  },
};
