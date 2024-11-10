import type { DisconnectOptions } from "@starknet-io/get-starknet"
import sn from "@starknet-io/get-starknet-core"
import { Connector, ConnectorData, StarknetkitConnector } from "./connectors"
import { defaultConnectors } from "./helpers/defaultConnectors"
import { getStoreVersionFromBrowser } from "./helpers/getStoreVersionFromBrowser"
import {
  removeStarknetLastConnectedWallet,
  setStarknetLastConnectedWallet,
} from "./helpers/lastConnected"
import { mapModalWallets } from "./helpers/mapModalWallets"
import Modal from "./modal/Modal.svelte"
import css from "./theme.css?inline"
import type {
  ConnectOptions,
  ConnectOptionsWithConnectors,
  ModalResult,
  ModalWallet,
} from "./types/modal"
import { TBAStarknetWindowObject } from "./connectors/tokenboundAccount/types/connector"
import { ConnectorNotConnectedError, NotTokenboundAccountOwner } from "./errors"
import hasAccountOwnership from "./connectors/tokenboundAccount/helpers/utils"
import { RpcProvider } from "starknet"
let selectedConnector: StarknetkitConnector | null = null

export const connect = async ({
  modalMode = "alwaysAsk",
  storeVersion = getStoreVersionFromBrowser(),
  modalTheme,
  dappName,
  resultType = "wallet",
  ...restOptions
}: ConnectOptionsWithConnectors | ConnectOptions): Promise<ModalResult> => {
  const { tokenboundOptions } = restOptions as ConnectOptions
  const { connectors } = restOptions as ConnectOptionsWithConnectors
  selectedConnector = null
  const availableConnectors =
    !connectors || connectors.length === 0
      ? defaultConnectors({
          tokenboundOptions,
        })
      : connectors

  const lastWalletId = localStorage.getItem("starknetLastConnectedWallet")
  if (modalMode === "neverAsk") {
    try {
      const connector =
        availableConnectors.find((c) => c.id === lastWalletId) ?? null

      let connectorData: ConnectorData | null = null

      if (connector && resultType === "wallet") {
        connectorData = await connector.connect()
      }

      return {
        connector,
        wallet: connector?.wallet ?? null,
        connectorData,
      }
    } catch (error) {
      removeStarknetLastConnectedWallet()
      throw new Error(error as any)
    }
  }

  const installedWallets = await sn.getAvailableWallets(restOptions)
  // we return/display wallet options once per first-dapp (ever) connect
  if (modalMode === "canAsk") {
    const authorizedWallets = await sn.getAuthorizedWallets(restOptions)

    const wallet =
      (authorizedWallets.find((w) => w.id === lastWalletId) ??
      installedWallets.length === 1)
        ? installedWallets[0]
        : undefined

    if (wallet) {
      const connector = availableConnectors.find((c) => c.id === lastWalletId)

      let connectorData: ConnectorData | null = null

      if (resultType === "wallet") {
        connectorData = (await connector?.connect()) ?? null
      }

      if (connector) {
        selectedConnector = connector
      }

      return {
        connector: selectedConnector,
        connectorData,
        wallet: selectedConnector?.wallet ?? null,
      }
    }
  }

  const modalWallets: ModalWallet[] = mapModalWallets({
    availableConnectors,
    installedWallets,
    discoveryWallets: await sn.getDiscoveryWallets(restOptions),
    storeVersion,
    customOrder: connectors ? connectors?.length > 0 : false,
  })

  const getTarget = (): ShadowRoot => {
    const modalId = "starknetkit-modal-container"
    const existingElement = document.getElementById(modalId)
    if (existingElement) {
      if (existingElement.shadowRoot) {
        // element already exists, use the existing as target
        return existingElement.shadowRoot
      }
      // element exists but shadowRoot cannot be accessed
      // delete the element and create new
      existingElement.remove()
    }

    const element = document.createElement("div")
    // set id for future retrieval
    element.id = modalId
    document.body.appendChild(element)
    const target = element.attachShadow({ mode: "open" })
    target.innerHTML = `<style>${css}</style>`

    return target
  }

  return new Promise((resolve, reject) => {
    const modal = new Modal({
      target: getTarget(),
      props: {
        dappName,
        callback: async (connector: StarknetkitConnector | null) => {
          try {
            selectedConnector = connector
            if (!selectedConnector) throw new ConnectorNotConnectedError()
            const connectorData = (await connector?.connect()) ?? null
            if (!selectedConnector.wallet) return
            const {
              selectedAddress,
              parentAccount,
              chainId,
              parentAccountId,
              provider,
            } = selectedConnector.wallet
            if (parentAccount) {
              const isOwnerOfTBA = await hasAccountOwnership(
                chainId,
                selectedAddress,
                provider as RpcProvider,
                parentAccount,
              )
              if (!isOwnerOfTBA) throw new NotTokenboundAccountOwner()
            }
            const wallet =
              resultType === "wallet" ? selectedConnector.wallet : null
            if (wallet) {
              setStarknetLastConnectedWallet(parentAccountId)
            }
            resolve({
              connector,
              connectorData,
              wallet,
            })
          } catch (error) {
            reject(error)
          } finally {
            setTimeout(() => modal.$destroy())
          }
        },
        theme: modalTheme === "system" ? null : (modalTheme ?? null),
        modalWallets,
      },
    })
  })
}

// Should be used after a sucessful connect
export const getSelectedConnectorWallet = () =>
  selectedConnector ? selectedConnector.wallet : null

export const disconnect = async (options: DisconnectOptions = {}) => {
  removeStarknetLastConnectedWallet()
  if (selectedConnector) {
    await selectedConnector.disconnect()
  }
  selectedConnector = null
  return sn.disconnect(options)
}

export type {
  Connector,
  ConnectorData,
  DisconnectOptions,
  StarknetkitConnector,
  TBAStarknetWindowObject,
  defaultConnectors as starknetkitDefaultConnectors,
  ConnectOptions,
  ConnectOptionsWithConnectors,
}

export type * from "./types/modal"
