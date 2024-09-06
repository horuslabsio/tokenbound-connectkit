import type { StarknetWindowObject } from "@starknet-io/types-js"
import { getTokenboundAccountStarknetObject } from "../starknetWindowObject/getTokenboundWalletStarknetObject"
import { createModal, hideModal } from "../starknetWindowObject/wormhole"
import { openWebwallet } from "../../webwallet/helpers/openWebwallet";
import { WalletNotFoundError } from "../../../errors";


interface Options {
  address: string;
  parentWallet: string
}


const getIframeMessageData = (): Promise<any> => {
  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      resolve(event.data);
      window.removeEventListener('message', handleMessage); // Clean up listener
    };

    window.addEventListener('message', handleMessage, false);
  });
};


export const openTokenboundModal = async (
  origin: string,
  chainId: string,
): Promise<StarknetWindowObject | undefined> => {
  const modalId = "tokenbound-account-modal";
  const iframeId = "tokenbound-account-iframe";

  // Remove existing iframe and modal if they exist to avoid duplicates
  const existingIframe = document.getElementById(iframeId);
  const existingModal = document.getElementById(modalId);
  if (existingIframe && existingModal) {
    existingIframe.remove();
    existingModal.remove();
  }

  // Create the modal and iframe
  const { modal } = await createModal(origin, true);
  return new Promise<StarknetWindowObject | undefined>((resolve) => {
    window.addEventListener(
      "message",
      async (event: MessageEvent) => {
        if (event.type === "message") {
          const { address, parentWallet }: Options = await getIframeMessageData();
          if (!parentWallet || !address) return;

          const wallet_id = parentWallet.toLowerCase();
          const globalObject: Record<string, any> = globalThis;
          let wallet: StarknetWindowObject | undefined;

          if (wallet_id === "braavos" || wallet_id === "argentx") {
            wallet = globalObject[`starknet_${wallet_id === "argentx" ? "argentX" : wallet_id}`];
          }

          if(wallet_id === "argentwebwallet"){
            // _wallet = (await openWebwallet(origin)) ?? null

          }
          if (wallet) {
            const starknetWindowObject = await getTokenboundAccountStarknetObject({
              address,
              wallet,
              chainId,
            });
            resolve(starknetWindowObject);
            hideModal(modal); // Close the modal upon successful connection
          }
        }
      },
      { once: false }
    );
  });
};


