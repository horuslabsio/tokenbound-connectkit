import type {
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  WalletEvents,
} from "@starknet-io/types-js"
import { Account, AccountInterface, constants, ProviderInterface, RpcProvider, WalletAccount } from "starknet"
import { TokenboundAccount } from "./account"
import { RPC_NODE_URL_TESTNET } from "../constants"
import { TBAStarknetWindowObject } from "../types/connector"

export const userEventHandlers: WalletEvents[] = []
export type Variant = "argentX" | "argentWebWallet" | "TBA"

export interface TBAStarknetWindowObjectOptions {
  id: Variant
  icon: string
  name: string
  version: string
  isConnected: boolean
  chainId: string
  selectedAddress: string
  account: Account
  provider: ProviderInterface

}

export type LoginStatus = {
  isLoggedIn?: boolean
  hasSession?: boolean
  isPreauthorized?: boolean
}

export const getTokenboundStarknetWindowObject = (
  options: TBAStarknetWindowObjectOptions,
  address: string,
  parentWallet: StarknetWindowObject,
  chainId: string,
): TBAStarknetWindowObject => {

  const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL_TESTNET })

  const wallet: TBAStarknetWindowObject = {
    ...options,
    async request(call) {
      switch (call.type) {
        case "wallet_requestAccounts": {
          try {
            const walletAccount = new WalletAccount(provider, parentWallet)

            await updateStarknetWindowObject(
              chainId,
              provider,
              wallet,
              address,
              walletAccount

            )

            return [address]

          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message)
            }
            throw new Error('Unknown error on enable wallet')
          }
        }

        case "wallet_getPermissions": {
          throw new Error("not implemented")
        }

        case "wallet_requestChainId": {
          const chainId = await this.request({ type: "wallet_requestChainId" })
          return chainId as constants.StarknetChainId
        }

        default:
          throw new Error("not implemented")
      }
    },

    on: (event, handleEvent) => {
      if (event === "accountsChanged") {
        userEventHandlers.push({
          type: event,
          handler: handleEvent as AccountChangeEventHandler,
        })
      } else if (event === "networkChanged") {
        userEventHandlers.push({
          type: event,
          handler: handleEvent as NetworkChangeEventHandler,
        })
      } else {
        throw new Error(`Unknwown event: ${event}`)
      }
    },
    off: (event, handleEvent) => {
      if (event !== "accountsChanged" && event !== "networkChanged") {
        throw new Error(`Unknwown event: ${event}`)
      }

      const eventIndex = userEventHandlers.findIndex(
        (userEvent) => userEvent.type === event && userEvent.handler === handleEvent
      )

      if (eventIndex >= 0) {
        userEventHandlers.splice(eventIndex, 1)
      }
    },
  }
  return wallet
}




export async function updateStarknetWindowObject(
  chainId: string,
  provider: ProviderInterface,
  wallet: StarknetWindowObject,
  tokenboundAddress: string,
  walletAccount: WalletAccount,

): Promise<TBAStarknetWindowObject> {

  const { id, name, version } = wallet;

  if (walletAccount && walletAccount.address) {

    let account = walletAccount.address;
    
    console.log(account, "hello world");

  } else {

    console.log("Address not found in walletAccount.");

  }

  const valuesToAssign: Pick<
    TBAStarknetWindowObject,
    | 'id'
    | 'name'
    | 'icon'
    | 'version'
    | 'isConnected'
    | 'chainId'
    | 'selectedAddress'
    | 'parentAccount'
    | 'account'
    | 'provider'
  > = {
    id: id,
    name: name,
    icon: "light",
    version: version,
    isConnected: true,
    chainId,
    selectedAddress: tokenboundAddress,
    parentAccount: chainId,
    account: new TokenboundAccount(
      provider,
      tokenboundAddress,
      walletAccount,
      ""
    ),
    provider,
  };
  return Object.assign(wallet, valuesToAssign);
}
