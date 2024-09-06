import {  getTokenboundStarknetWindowObject } from "./tokenboundStarknetWindowObject"

import { TOKENBOUND_ACCOUNT_ICON } from "../constants"
import { StarknetWindowObject } from "@starknet-io/types-js"



export type ModalEvents =
  | {
    action: "show" | "hide"
    visible: boolean
  }
  | { action: "updateHeight"; height: number }
  | { action: "updateWidth"; width: number }
  | { action: "updateSize"; width: number; height: number }

interface Options {
  address: string;
  wallet: StarknetWindowObject,
  chainId: string
}

export const getTokenboundAccountStarknetObject = async ({ address, wallet, chainId }: Options
): Promise<StarknetWindowObject> => {

  const globalWindow = typeof window !== "undefined" ? window : undefined
  if (!globalWindow) {
    throw new Error("window is not defined")
  }

  const starknetWindowObject = getTokenboundStarknetWindowObject(
    {
      id: "TBA",
      icon: TOKENBOUND_ACCOUNT_ICON,
      name: "Tokenbound Account",
      version: "1.0.0",
    },
    address,
    wallet,
    chainId

  )
  return starknetWindowObject
}
