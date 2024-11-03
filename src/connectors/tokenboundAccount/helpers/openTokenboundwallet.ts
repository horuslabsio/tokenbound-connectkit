import { getTokenboundAccountStarknetObject } from "../starknetWindowObject/getTokenboundWalletStarknetObject"
import { createModal, hideModal } from "../starknetWindowObject/wormhole"
import { openWebwallet } from "../webwallet/helpers/openWebwallet"
import { TBAStarknetWindowObject } from "../types/connector"
import { DEFAULT_WEBWALLET_URL } from "../constants"
import { WebWalletStarknetWindowObject } from "../webwallet/starknetWindowObject/argentStarknetWindowObject"
import { Account, AccountInterface, RpcProvider } from "starknet"
import { RequestFnCall, RpcMessage, RpcTypeToMessageMap, StarknetWindowObject, WalletEventHandlers } from "@starknet-io/types-js"
import { getTokenboundAccountController } from "../controller/getControllerStarknetWindowObject"

interface Options {
  address: string
  parentWallet: string,
  controller: Account
}



export const openTokenboundModal = async (
  origin: string,
  chainId: string,
): Promise<TBAStarknetWindowObject | undefined> => {
  const modalId = "tokenbound-account-modal";
  const iframeId = "tokenbound-account-iframe";

  const existingIframe = document.getElementById(iframeId);
  const existingModal = document.getElementById(modalId);

  // Remove existing elements if they exist
  if (existingIframe) existingIframe.remove();
  if (existingModal) existingModal.remove();

  const { modal } = await createModal(origin, true);

  return new Promise<TBAStarknetWindowObject | undefined>((resolve) => {
    window.addEventListener(
      "message",
      async (event: MessageEvent) => {

        if (event.origin != origin ) return;

        const { address, parentWallet, controller }: Options = event.data;
        if (!parentWallet || !address) return;


        const wallet_id = parentWallet.toLowerCase();
        const globalObject: Record<string, any> = globalThis;
        let wallet: TBAStarknetWindowObject | undefined;

        try {

          // Check wallet type and instantiate wallet accordingly

          if (wallet_id === "braavos" || wallet_id === "argentx") {
            wallet =
              globalObject[
                `starknet_${wallet_id === "argentx" ? "argentX" : wallet_id}`
              ];

          } 
          
          // Argent web wallet
          else if (wallet_id === "argentwebwallet") {

            const webWallet = (await openWebwallet(DEFAULT_WEBWALLET_URL)) ?? null;
            await (webWallet as WebWalletStarknetWindowObject).connectWebwallet();
            wallet = webWallet as TBAStarknetWindowObject;

          } 
          
          // catridge controller
          else if (wallet_id === "controller") {

            let account = controller;
            const { channel } = account;
            const provider = new RpcProvider({ nodeUrl: channel.nodeUrl });
            const starknetWindowObject = getTokenboundAccountController({
              account,
              address,
              provider,
              chainId,
            });
            resolve(starknetWindowObject);
            hideModal(modal);
            return;
          }




          if (!wallet) {
            alert("Wallet not found!");
            return;
          }

          // Resolve with starknet window object for supported wallets
          const starknetWindowObject = await getTokenboundAccountStarknetObject({
            address,
            wallet,
            chainId,
          });

          resolve(starknetWindowObject);
          hideModal(modal);

        } catch (error) {
          console.error("Error handling wallet connection:", error);
          resolve(undefined);
          hideModal(modal);
        }
      },
      { once: true },
    );
  });
};