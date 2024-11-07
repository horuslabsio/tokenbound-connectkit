import { num, RpcProvider } from "starknet";
import { AccountClassHashes, MAINNET_NODE_URL, SEPOLIA_CHAIN_ID, SEPOLIA_NODE_URL } from "../constants";
import { TBAChainID, TBAVersion, TokenboundClient } from "starknet-tokenbound-sdk";

export default async function hasAccountOwnership(chainId: string, tokenboundAddress: string, parentAccountAddress: string): Promise<boolean> {
  if(!tokenboundAddress) return false
    const NODE_URL = num.toHex(chainId) === SEPOLIA_CHAIN_ID ? SEPOLIA_NODE_URL : MAINNET_NODE_URL;
    const provider = new RpcProvider({ nodeUrl: NODE_URL });
    let tbaClassHash;
    try {
      tbaClassHash = await provider.getClassHashAt(tokenboundAddress);
    } catch (e) {
      console.log(e)
      throw new Error("Failed to fetch TBA class hash: Try again")
    }
    const network = num.toHex(chainId) === SEPOLIA_CHAIN_ID ? "sepolia" : "mainnet";
    const implementations = {
      [TBAVersion.V2]: AccountClassHashes.V2[network as keyof typeof AccountClassHashes.V2],
      [TBAVersion.V3]: AccountClassHashes.V3[network as keyof typeof AccountClassHashes.V3],
    };

    let version: typeof TBAVersion[keyof typeof TBAVersion] | null = null;

    for (const [ver, impl] of Object.entries(implementations)) {
      if (tbaClassHash === impl) {
        version = ver as typeof TBAVersion[keyof typeof TBAVersion];
        break;
      }
    }
    if (!version) return false;
    const options = {
      walletClient: { address: "", privateKey: "" },
      chain_id: network === "sepolia" ? TBAChainID.sepolia : TBAChainID.main,
      version,
      jsonRPC: NODE_URL,
    };

    const tokenbound = new TokenboundClient(options);
    try {
      const owner = await tokenbound.getOwner({ tbaAddress: tokenboundAddress });
      const account = num.toHex(owner)
      if (account) {
        return account === parentAccountAddress;
      }
      return false
    } catch (e) {
      throw new Error("Failed to get TBA owner: Try again")
    }
  
}
