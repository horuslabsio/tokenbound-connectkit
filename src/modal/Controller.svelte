<script lang="ts">
  import { onMount } from "svelte"
  import Controller from "@cartridge/controller"
  import {AccountInterface } from "starknet"

  export const ETH_CONTRACT =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"

  export let onConnect: (
    account: AccountInterface,
    controller: Controller,
  ) => void

  export let hideModal: () => void

  export let rpc: string

  let controller = new Controller({
    policies: [
      {
        target: ETH_CONTRACT,
        method: "approve",
        description:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      },
      {
        target: ETH_CONTRACT,
        method: "transfer",
      },
      {
        target: ETH_CONTRACT,
        method: "mint",
      },
      {
        target: ETH_CONTRACT,
        method: "burn",
      },
      {
        target: ETH_CONTRACT,
        method: "allowance",
      },
    ],
    rpc,
  })


  async function connect() {
    try {
      await controller.probe()
      const account = await controller.connect()
      if (account) {
        onConnect(account , controller)
      }
    } catch (e) {
      console.log(e)
    }
  }

  onMount(async () => {
    hideModal()
    await controller.probe()
    await connect()
  })
</script>
