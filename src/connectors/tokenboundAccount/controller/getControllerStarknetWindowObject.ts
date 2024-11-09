import { Account, ProviderInterface } from "starknet"
import { TOKENBOUND_ACCOUNT_ICON } from "../constants"
import { TBAStarknetWindowObject } from "../types/connector"
import { getTokenboundControllerStarknetWindowObject } from "./controllerStarknetWindowObject"

interface Options {
  address: string
  account: Account
  provider: ProviderInterface
  chainId: string
}

export const getTokenboundAccountController = async ({
  address,
  account,
  provider,
  chainId,
}: Options): Promise<TBAStarknetWindowObject> => {
  const globalWindow = typeof window !== "undefined" ? window : undefined
  if (!globalWindow) {
    throw new Error("window is not defined")
  }
  const starknetWindowObject = getTokenboundControllerStarknetWindowObject(
    {
      id: "TBA",
      icon: TOKENBOUND_ACCOUNT_ICON,
      name: "Tokenbound Account",
      version: "1.0.0",
      chainId: chainId,
      parentAccountId: "",
      isConnected: false,
      selectedAddress: "",

      account: account,
      provider: provider,
    },
    address,
  )
  return starknetWindowObject
}
