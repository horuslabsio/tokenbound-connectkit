import { type AccountChangeEventHandler } from "@starknet-io/get-starknet-core"
import {
  AccountInterface,
  ProviderInterface,
  ProviderOptions,
  RpcProvider,
  WalletAccount,
  num
} from "starknet"
import {
  Permission,
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
} from "@starknet-io/types-js"
import {
  ConnectorNotConnectedError,
  ConnectorNotFoundError,
  UserRejectedRequestError,
} from "../../errors"
import { getStarknetChainId } from "../../helpers/getStarknetChainId"
import { resetWalletConnect } from "../../helpers/resetWalletConnect"
import {
  Connector,
  type ConnectorData,
  type ConnectorIcons,
} from "../connector"
import { AccountClassHashes, DEFAULT_CHAIN_ID, DEFAULT_TOKENBOUNDACCOUNT_URL, MAINNET_NODE_URL, SEPOLIA_CHAIN_ID, SEPOLIA_NODE_URL, TOKENBOUND_ACCOUNT_ICON } from "./constants"
import { openTokenboundModal } from "./helpers/openTokenboundwallet"
import { TBAStarknetWindowObject } from "./types/connector"
import { TBAChainID, TBAVersion, TokenboundClient, WalletClient } from "starknet-tokenbound-sdk"
import Controller from "@cartridge/controller"

export interface TokenboundConnectorOptions {
  chainId: string
}

export class TokenboundConnector extends Connector {
  private _wallet: TBAStarknetWindowObject | null = null
  private _options: TokenboundConnectorOptions

  constructor(options: TokenboundConnectorOptions) {
    super()
    this._options = options
  }

  available(): boolean {
    return true
  }

  async ready(): Promise<boolean> {
    if (!this._wallet) {
      return false
    }

    try {
      const permissions = await this._wallet.request({
        type: "wallet_getPermissions",
      })

      return (permissions as Permission[]).includes(Permission.ACCOUNTS)
    } catch {
      return false
    }
  }

  get id(): string {
    return "TBA"
  }

  get name(): string {
    return "Tokenbound Account"
  }

  get icon(): ConnectorIcons {
    return {
      dark: TOKENBOUND_ACCOUNT_ICON,
      light: TOKENBOUND_ACCOUNT_ICON,
    }
  }

  get wallet(): TBAStarknetWindowObject {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    return this._wallet
  }

  async connect(): Promise<ConnectorData> {
    await this.ensureWallet()

    if (!this._wallet) {
      throw new ConnectorNotFoundError()
    }

    const accounts = await this._wallet.request({
      type: "wallet_requestAccounts",
      params: { silent_mode: false },
    })

    const chainId = await this.chainId()


  //  const isOwnerofTBA =  await this.hasAccountOwnership(
  //     chainId.toString(),
  //     this.wallet
  //   )

  //   if(!isOwnerofTBA){
  //     throw new NotTokenboundAccountOwner()

  //   }

    return {
      account: accounts[0],
      chainId,
    }
  }

  async disconnect(): Promise<void> {
    resetWalletConnect()

    if (!this.available() && !this._wallet) {
      throw new ConnectorNotFoundError()
    }

    this._wallet = null
  }

  async account(
    provider: ProviderOptions | ProviderInterface,
  ): Promise<AccountInterface> {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()

    }
    return new WalletAccount(provider, this._wallet)
  }

  async chainId(): Promise<bigint> {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    const chainId = this._options.chainId

    const hexChainId = getStarknetChainId(chainId)


    return BigInt(hexChainId)


  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }

    try {
      return await this._wallet.request(call)
    } catch {
      throw new UserRejectedRequestError()
    }
  }

  async initEventListener(accountChangeCb: AccountChangeEventHandler) {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    this._wallet.on("accountsChanged", accountChangeCb)
  }

  async removeEventListener(accountChangeCb: AccountChangeEventHandler) {
    if (!this._wallet) {
      throw new ConnectorNotConnectedError()
    }
    this._wallet.off("accountsChanged", accountChangeCb)
    this._wallet = null
  }





  private async hasAccountOwnership(chainId: string, wallet: TBAStarknetWindowObject): Promise<boolean> {
    const NODE_URL =  num.toHex(chainId) === SEPOLIA_CHAIN_ID ? SEPOLIA_NODE_URL : MAINNET_NODE_URL;

    const provider = new RpcProvider({ nodeUrl: NODE_URL });
  
    const tbaClassHash = await provider.getClassHashAt(wallet.selectedAddress);


    const network = num.toHex(chainId) === SEPOLIA_CHAIN_ID ? "sepolia" : "mainnet";
  
    // Determine version and implementation based on network
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
  
    // Common options for TokenboundClient
    const options = {
      walletClient: { address: "", privateKey: "" },
      chain_id: network === "sepolia" ? TBAChainID.sepolia : TBAChainID.main,
      version,
      jsonRPC: NODE_URL,
    };
  
    try {

      const tokenbound = new TokenboundClient(options);
      const owner = await tokenbound.getOwner({ tbaAddress: wallet.selectedAddress });
      const account = num.toHex(owner)
      return account === wallet.parentAccount;
    } catch (e) {
      console.error("Failed to get TBA owner:", e);
      return false;
    }
  }
  




  private async ensureWallet(): Promise<void> {
    const hexChainId = this._options ? BigInt(getStarknetChainId(this._options.chainId)) : BigInt(getStarknetChainId(DEFAULT_CHAIN_ID))
    let _wallet = (await openTokenboundModal(DEFAULT_TOKENBOUNDACCOUNT_URL, hexChainId.toString())) ?? null
    if (_wallet) {
      this._wallet = _wallet
    }

  }

}


