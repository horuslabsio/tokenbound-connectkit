import { TBAStarknetWindowObject } from "../types/connector"
import sn from "@starknet-io/get-starknet-core"


export default async function hasApprove(wallet: TBAStarknetWindowObject): Promise<boolean> {
    const authorizedWallets = await sn.getAuthorizedWallets()

    console.log(authorizedWallets,)
    const authorizedWallet =
      authorizedWallets.find((w) => w.id === wallet.parentAccountId)

    if (authorizedWallet) {
      return true
    }
    return false
  }
