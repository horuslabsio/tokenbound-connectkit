import type {
    AccountChangeEventHandler,
    NetworkChangeEventHandler,
    StarknetWindowObject,
    WalletEvents,
} from "@starknet-io/types-js"
import { Account, AccountInterface, Call, CallData, constants, ProviderInterface, RawArgs, RpcProvider, WalletAccount, } from "starknet"
import { MAINNET_NODE_URL, SEPOLIA_CHAIN_ID, SEPOLIA_NODE_URL } from "../constants"
import { TBAStarknetWindowObject } from "../types/connector"




export const userEventHandlers: WalletEvents[] = []

export type Variant = "argentX" | "argentWebWallet" | "TBA"

export interface TBAStarknetWindowObjectOptions {
    id: Variant
    icon: string
    name: string
    version: string
    isConnected: boolean
    selectedAddress: string
    account: Account
    provider: ProviderInterface,
    chainId: string

}



export const getTokenboundControllerStarknetWindowObject =  (
    options: TBAStarknetWindowObjectOptions,
    address: string,
): TBAStarknetWindowObject => {

    const { provider, account, chainId } = options;


    const wallet: TBAStarknetWindowObject = {
        ...options,
        async request(call) {
            switch (call.type) {
                case "wallet_requestAccounts": {
                    try {
                        await updateStarknetWindowObject(
                            chainId,
                            provider,
                            wallet,
                            address,
                            account
                        )

                        return [address]

                    } catch (error) {
                        if (error instanceof Error) {
                            throw new Error(error.message)
                        }
                        throw new Error('Unknown error on enable wallet')
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
                (userEvent) => userEvent.type === event && userEvent.handler === handleEvent
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
    provider: ProviderInterface,
    wallet: StarknetWindowObject,
    tokenboundAddress: string,
    account: Account

): Promise<TBAStarknetWindowObject> {

    const { id, name, version } = wallet;

    const valuesToAssign: Pick<
        TBAStarknetWindowObject,
        | 'id'
        | 'name'
        | 'icon'
        | 'version'
        | 'isConnected'
        | 'chainId'
        | 'selectedAddress'
        | 'parentAccount'
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
        parentAccount: account.address,
        account: new TokenboundControllerAccount(
            provider,
            tokenboundAddress,
            account,
        ),
        provider,
    };

    return Object.assign(wallet, valuesToAssign);
}



class TokenboundControllerAccount extends Account implements AccountInterface {
    constructor(
        provider: ProviderInterface,
        public address: string,
        public parentAccount: Account,
    ) {
        super(provider, address, parentAccount.signer);
    }

    override execute = async (
        calls: Call[]
    ) => {
        try {
            const transactions = Array.isArray(calls) ? calls : [calls];

            const txns = transactions.map((call) => ({
                contractAddress: call.contractAddress,
                entrypoint: call.entrypoint,
                calldata: Array.isArray(call.calldata) && '__compiled__' in call.calldata
                    ? call.calldata
                    : CallData.compile(call.calldata as RawArgs)
            }))

            let callToBeExecuted: Call = {
                contractAddress: this.address,
                entrypoint: '__execute__',
                calldata: CallData.compile({ txns })
            }

            return await this.parentAccount.execute(callToBeExecuted)
        }
        catch (error) {
            console.log(error);
            throw new Error("Error while executing a transaction");
        }
    }
}
