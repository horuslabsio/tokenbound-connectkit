import type {
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  WalletEvents,
} from "@starknet-io/types-js"
import { constants, ProviderInterface, RpcProvider, WalletAccount } from "starknet"
import { TokenboundAccount } from "./account"
import { RPC_NODE_URL_TESTNET } from "../constants"
import { ConnectedStarknetWindowObject } from "../types/connector"

export const userEventHandlers: WalletEvents[] = []
export type Variant = "argentX" | "argentWebWallet" | "TBA"
export interface GetArgentStarknetWindowObject {
  id: Variant
  icon: string
  name: string
  version: string
}

export type LoginStatus = {
  isLoggedIn?: boolean
  hasSession?: boolean
  isPreauthorized?: boolean
}

export const getTokenboundStarknetWindowObject = (
  options: GetArgentStarknetWindowObject,
  address: string,
  parentWallet: StarknetWindowObject,
  chainId: string,
): StarknetWindowObject => {

  const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL_TESTNET })

  const wallet: StarknetWindowObject = {
    ...options,
    async request(call) {
      switch (call.type) {
        case "wallet_requestAccounts": {
          try {
            const walletAccount = new WalletAccount(provider, parentWallet);
            await updateStarknetWindowObject(
              wallet,
              provider,
              address,
              chainId,
              walletAccount,
             
            );

            return [address];

          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message);
            }
            throw new Error('Unknown error on enable wallet');
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
        (userEvent) =>
          userEvent.type === event && userEvent.handler === handleEvent,
      )

      if (eventIndex >= 0) {
        userEventHandlers.splice(eventIndex, 1)
      }
    },
  }
  return wallet
}




export async function updateStarknetWindowObject(
  wallet: StarknetWindowObject,
  provider: ProviderInterface,
  tokenboundAddress: string,
  chainId: string,
  walletAccount: WalletAccount,

): Promise<ConnectedStarknetWindowObject> {

  const { id, name, version } = wallet;

  const valuesToAssign: Pick<
    ConnectedStarknetWindowObject,
    | 'id'
    | 'name'
    | 'icon'
    | 'version'
    | 'isConnected'
    | 'chainId'
    | 'selectedAddress'
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
    account: new TokenboundAccount(
      provider,
      tokenboundAddress,
      walletAccount,
    ),
    provider,
  };
  return Object.assign(wallet, valuesToAssign);
}
