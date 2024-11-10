import { getTokenboundAccountStarknetObject } from "../starknetWindowObject/getTokenboundWalletStarknetObject"
import { createModal, hideModal } from "../starknetWindowObject/wormhole"
import { openWebwallet } from "../webwallet/helpers/openWebwallet"
import { TBAStarknetWindowObject } from "../types/connector"
import { DEFAULT_WEBWALLET_URL, SEPOLIA_CHAIN_ID } from "../constants"
import { WebWalletStarknetWindowObject } from "../webwallet/starknetWindowObject/argentStarknetWindowObject"
import { Account, num, RpcProvider } from "starknet"
import ControllerModal from "../../../modal/Controller.svelte"
import { getTokenboundAccountController } from "../controller/getControllerStarknetWindowObject"
import Controller from "@cartridge/controller"

interface Options {
  address: string
  parentWallet: string
  controller: Account
  action: string
}

export const getTarget = (): ShadowRoot => {
  const modalId = "controller-modal-container"
  const existingElement = document.getElementById(modalId)

  if (existingElement) {
    if (existingElement.shadowRoot) {
      return existingElement.shadowRoot
    }
    // Remove existing element if no shadowRoot
    existingElement.remove()
  }

  // Create new container element and attach shadow DOM
  const element = document.createElement("div")
  element.id = modalId
  document.body.appendChild(element)
  const target = element.attachShadow({ mode: "open" })

  return target
}

export const openTokenboundModal = async (
  origin: string,
  chainId: string,
): Promise<
  | { starknetWindowObject?: TBAStarknetWindowObject; controller?: Controller }
  | undefined
> => {
  const modalId = "tokenbound-account-modal"
  const iframeId = "tokenbound-account-iframe"

  const existingIframe = document.getElementById(iframeId)
  const existingModal = document.getElementById(modalId)

  if (existingIframe) existingIframe.remove()
  if (existingModal) existingModal.remove()

  const { modal } = await createModal(origin, true)
  return new Promise<
    | {
        starknetWindowObject?: TBAStarknetWindowObject
        controller?: Controller
      }
    | undefined
  >((resolve) => {
    window.addEventListener(
      "message",
      async (event: MessageEvent) => {
        if (event.origin != origin) return
        const { address, parentWallet, action }: Options =
          event.data
        if (action === "closeConnectKit") {
          hideModal(modal)
        }
        if (!parentWallet || !address) return
        const wallet_id = parentWallet.toLowerCase()
        const globalObject: Record<string, any> = globalThis
        let wallet: TBAStarknetWindowObject | undefined

        try {
          // Check wallet type and instantiate wallet accordingly
          if (wallet_id === "braavos" || wallet_id === "argentx") {
            wallet =
              globalObject[
                `starknet_${wallet_id === "argentx" ? "argentX" : wallet_id}`
              ]
          }
          // Argent web wallet
          else if (wallet_id === "argentwebwallet") {
            const webWallet =
              (await openWebwallet(DEFAULT_WEBWALLET_URL)) ?? null
            await (
              webWallet as WebWalletStarknetWindowObject
            ).connectWebwallet()
            wallet = webWallet as TBAStarknetWindowObject
          }
          // catridge controller
          else if (wallet_id === "controller") {
            let account: Account | null = null
            const shadowTarget = getTarget()
            new ControllerModal({
              target: shadowTarget,
              props: {
                onConnect: (
                  connectedAccount: Account,
                  controller: Controller,
                ) => {
                  account = connectedAccount
                  handleAccount(account, controller)
                },
                hideModal: () => {
                  hideModal(modal)
                },
                rpc:
                  num.toHex(chainId) == SEPOLIA_CHAIN_ID
                    ? "https://api.cartridge.gg/x/starknet/sepolia"
                    : "https://api.cartridge.gg/x/starknet/mainnet",
              },
            })

            async function handleAccount(
              account: Account | null,
              controller: Controller,
            ) {
              const chainId = await account?.getChainId()
              const provider = new RpcProvider({
                nodeUrl: account?.channel.nodeUrl,
              })
              if (account && chainId) {
                const starknetWindowObject =
                  await getTokenboundAccountController({
                    address,
                    account,
                    provider,
                    chainId,
                  })
                resolve({ starknetWindowObject, controller })
                hideModal(modal)
              }
            }
            return
          }
          if (!wallet) {
            alert("Wallet not found!")
            return
          }
          const starknetWindowObject = await getTokenboundAccountStarknetObject(
            {
              address,
              wallet,
              chainId,
            },
          )
          resolve({ starknetWindowObject })
          hideModal(modal)
        } catch (error) {
          console.error("Error handling wallet connection:", error)
          resolve(undefined)
          hideModal(modal)
        }
      },
      { once: true },
    )
  })
}
