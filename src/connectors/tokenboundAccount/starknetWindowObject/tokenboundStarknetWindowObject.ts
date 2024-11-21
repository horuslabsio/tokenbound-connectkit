import type {
  AccountChangeEventHandler,
  NetworkChangeEventHandler,
  StarknetWindowObject,
  WalletEvents,
} from "@starknet-io/types-js"
import {
  Account,
  constants,
  num,
  ProviderInterface,
  RpcProvider,
  WalletAccount,
} from "starknet"
import { TokenboundAccount } from "./account"
import {
  MAINNET_NODE_URL,
  SEPOLIA_CHAIN_ID,
  SEPOLIA_NODE_URL,
} from "../constants"
import { TBAStarknetWindowObject } from "../types/connector"
import { checkTbaVersion, waitForWalletAccountAddress } from "../helpers/utils"
export const userEventHandlers: WalletEvents[] = []
export type Variant = "argentX" | "argentWebWallet" | "TBA"

export interface TBAStarknetWindowObjectOptions {
  id: Variant
  icon: string
  name: string
  version: string
  isConnected: boolean
  parentAccountId: string
  chainId: string
  selectedAddress: string
  account: Account
  provider: ProviderInterface
}

export const getTokenboundStarknetWindowObject = (
  options: TBAStarknetWindowObjectOptions,
  address: string,
  parentWallet: StarknetWindowObject,
  chainId: string,
): TBAStarknetWindowObject => {

  const network =  chainId == SEPOLIA_CHAIN_ID ? "sepolia" : "mainnet"
  const provider = new RpcProvider({
    nodeUrl: `https://starknet-${network}.g.alchemy.com/starknet/version/rpc/v0_7/4PHlmV2x26oj0up8xY3ZuqjhHb7mSvfQ`,
  })
  const wallet: TBAStarknetWindowObject = {
    ...options,

    async request(call) {
      switch (call.type) {
        case "wallet_requestAccounts": {
          try {
            const walletAccount = new WalletAccount(provider, parentWallet)
            await waitForWalletAccountAddress(walletAccount)
            await updateStarknetWindowObject(
              chainId,
              provider,
              wallet,
              address,
              walletAccount,
            )
            return [address]
          } catch (error) {
            if (error instanceof Error) {
              throw new Error(error.message)
            }
            throw new Error("Unknown error on enable wallet")
          }
        }

        case "wallet_getPermissions": {
          throw new Error("Not Implemented")
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
  chainId: string,
  provider: RpcProvider,
  wallet: TBAStarknetWindowObject,
  tokenboundAddress: string,
  walletAccount: WalletAccount,
): Promise<TBAStarknetWindowObject> {
  const { id, name, version, parentAccountId } = wallet
  await walletAccount.getChainId()
  const parentAccountAddress: string = walletAccount.address
  const tbaVersion = await checkTbaVersion(provider, tokenboundAddress, chainId)
  const valuesToAssign: Pick<
    TBAStarknetWindowObject,
    | "id"
    | "name"
    | "icon"
    | "version"
    | "isConnected"
    | "chainId"
    | "selectedAddress"
    | "parentAccountId"
    | "parentAccount"
    | "account"
    | "provider"
  > = {
    id: id,
    name: name,
    icon: "light",
    version: version,
    isConnected: true,
    chainId: num.toHex(chainId),
    selectedAddress: tokenboundAddress,
    parentAccount: parentAccountAddress,
    parentAccountId: parentAccountId,
    account: new TokenboundAccount(
      provider,
      tokenboundAddress,
      tbaVersion ?? "V3",
      walletAccount,
    ),
    provider,
  }

  return Object.assign(wallet, valuesToAssign)
}
