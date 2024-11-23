<script lang="ts">
  import { onMount } from "svelte"
  import Controller from "@cartridge/controller"
  import { AccountInterface } from "starknet"

  export let onConnect: (
    account: AccountInterface,
    controller: Controller,
  ) => void

  interface Policy {
    target: string
    method: string
    description?: string
  }

  export let hideModal: () => void

  export let rpc: string

  export let policies: Policy[] = [];

  let controller = new Controller({
    policies,
    rpc,
  })

  async function connect() {
    try {
      await controller.probe()
      const account = await controller.connect()
      if (account) {
        onConnect(account, controller)
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
