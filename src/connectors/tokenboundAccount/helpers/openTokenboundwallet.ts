import { getTokenboundAccountStarknetObject } from "../starknetWindowObject/getTokenboundWalletStarknetObject"
import { createModal, hideModal } from "../starknetWindowObject/wormhole"
import { openWebwallet } from "../webwallet/helpers/openWebwallet"
import { TBAStarknetWindowObject } from "../types/connector"
import { DEFAULT_WEBWALLET_URL } from "../constants"
import { WebWalletStarknetWindowObject } from "../webwallet/starknetWindowObject/argentStarknetWindowObject"
import {  TBAChainID, TBAVersion, WalletClient } from "starknet-tokenbound-sdk"
import {} from "starknet"

interface Options {
  address: string
  parentWallet: string
}

const getIframeMessageData = (): Promise<any> => {
  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      resolve(event.data)
      window.removeEventListener("message", handleMessage) 
    }
    window.addEventListener("message", handleMessage, false)
  })
}



export const openTokenboundModal = async (
  origin: string,
  chainId: string,
): Promise<TBAStarknetWindowObject | undefined> => {

  const modalId = "tokenbound-account-modal";
  const iframeId = "tokenbound-account-iframe";

  const existingIframe = document.getElementById(iframeId);
  const existingModal = document.getElementById(modalId);
  if (existingIframe && existingModal) {
    existingIframe.remove();
    existingModal.remove();
  }

  const { modal } = await createModal(origin, true);
  return new Promise<TBAStarknetWindowObject | undefined>((resolve) => {
    window.addEventListener(
      "message",
      async (event: MessageEvent) => {
        if (event.type === "message") {
          const { address, parentWallet }: Options =
            await getIframeMessageData();
          
          if (!parentWallet || !address) return;

          const wallet_id = parentWallet.toLowerCase();
          const globalObject: Record<string, any> = globalThis;

          let wallet: TBAStarknetWindowObject | undefined;

          if (wallet_id === "braavos" || wallet_id === "argentx") {

            wallet =
              globalObject[
                `starknet_${wallet_id === "argentx" ? "argentX" : wallet_id}`
              ];

          }


          if (wallet_id === "argentwebwallet") {
            const webWallet = (await openWebwallet(DEFAULT_WEBWALLET_URL)) ?? null
             await (
              webWallet as WebWalletStarknetWindowObject
            ).connectWebwallet()
            wallet = webWallet as TBAStarknetWindowObject;
          }

          if (!wallet) {
            alert("Wallet not found!");
            return;
          }

          const starknetWindowObject = await getTokenboundAccountStarknetObject({
            address,
            wallet,
            chainId,
          });

          

          resolve(starknetWindowObject);
          hideModal(modal);
        }
      },
      { once: false },
    );
  });
};
