import { type AccountChangeEventHandler } from "@starknet-io/get-starknet-core"
import {
  AccountInterface,
  ProviderInterface,
  ProviderOptions,
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
import { CONTROLLER_ETH_CONTRACT, DEFAULT_CHAIN_ID, DEFAULT_TOKENBOUNDACCOUNT_URL, MAINNET_NODE_URL, SEPOLIA_CHAIN_ID, SEPOLIA_NODE_URL, TOKENBOUND_ACCOUNT_ICON } from "./constants"
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


    this.hasAccountOwnership(
      chainId.toString(),
      this.wallet
    )



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


  private async hasAccountOwnership(chainId: string, wallet: TBAStarknetWindowObject) {

    const walletClient: WalletClient = {
      address: "",
      privateKey: "",
    };

    const formattedChainId = num.toHex(num.toBigInt(chainId))

    const options = {
      walletClient: walletClient,
      chain_id: TBAChainID.sepolia,
      version: TBAVersion.V3,
      jsonRPC: `${formattedChainId === SEPOLIA_CHAIN_ID ? SEPOLIA_NODE_URL : MAINNET_NODE_URL}`,
    };

    let tbaAddress = wallet.selectedAddress

    const tokenbound = new TokenboundClient(options);

    const account = await tokenbound.getOwner({
      tbaAddress
    })


  }


  

  private async ensureWallet(): Promise<void> {
    const hexChainId = this._options ? BigInt(getStarknetChainId(this._options.chainId)) : BigInt(getStarknetChainId(DEFAULT_CHAIN_ID))
    let _wallet = (await openTokenboundModal(DEFAULT_TOKENBOUNDACCOUNT_URL, hexChainId.toString())) ?? null

    if (_wallet) {

      this._wallet = _wallet
    }

  }
}


