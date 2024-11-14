<script lang="ts">
  import { onMount } from "svelte"

  export let callback: (options: Options) => Promise<void> = async () => {}
  export let closeModal: () => void
  export let theme: "light" | "dark" | null = null

  let loading: boolean = false

  type Options = {
    address: string
    parentWallet: string
  }

  let options: Options = {
    address: "",
    parentWallet: "",
  }

  let errors = {
    address: "",
    parentWallet: "",
  }

  let wallets = [
    { id: "braavos", label: "Braavos" },
    { id: "argentx", label: "ArgentX" },
    { id: "ArgentWebWallet", label: "Argent Web Wallet" },
    { id: "controller", label: "Controller" },
  ]

  const setLoading = (state: boolean) => {
    loading = state
  }

  const handleSubmit = async () => {
    setLoading(true)

    const newErrors = {
      address: !options.address
        ? "Please enter a valid tokenbound account address"
        : "",
      parentWallet: !options.parentWallet ? "Please select parent wallet" : "",
    }
    errors = newErrors
    if (Object.values(newErrors).some((error) => error)) return
    try {
      await callback(options)
      setLoading(false)
    } catch (error) {
      console.error("Error in callback", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    let name = input.name
    options[name as keyof Options] = input.value
  }

  const handleSelectChange = (event: Event) => {
    const select = event.target as HTMLSelectElement
    options.parentWallet = select.value
  }

  let darkModeControlClass = theme === "dark" ? "dark" : ""
  onMount(() => {
    if (
      theme === "dark" ||
      (theme === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      darkModeControlClass = "dark"
    } else {
      darkModeControlClass = ""
    }
  })
</script>

<div
  part="tokenbound-modal"
  class={`modal-font backdrop-blur-sm fixed inset-0 flex items-center 
    justify-center bg-black/25 z-[9999] ${darkModeControlClass}`}
  role="dialog"
  aria-labelledby="modalTitle"
  aria-describedby="modalDescription"
  aria-hidden={true ? "false" : "true"}
>
  <main
    class="h-screen w-screen flex items-center justify-center overflow-y-hidden"
  >
    <div
      class="bg-overlay bg-left w-full max-w-[400px] md:max-w-[650px] font-poppins border border-gray-500 h-[65%] max-h-[450px] md:max-h-[420px] overflow-clip rounded-[14px] md:rounded-[24px] flex flex-col justify-between md:flex-row"
    >
      <div
        class="md:basis-[40%] basis-[20%] p-4 w-full relative rounded-[14px] flex flex-col gap-4 justify-center items-center"
      >
        <button
          id="close-button"
          on:click={closeModal}
          class="absolute left-4 top-4 text-white text-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              d="M9.77275 3.02275C9.99242 2.80308 9.99242 2.44692 9.77275 2.22725C9.55308 2.00758 9.19692 2.00758 8.97725 2.22725L6 5.20451L3.02275 2.22725C2.80308 2.00758 2.44692 2.00758 2.22725 2.22725C2.00758 2.44692 2.00758 2.80308 2.22725 3.02275L5.20451 6L2.22725 8.97725C2.00758 9.19692 2.00758 9.55308 2.22725 9.77275C2.44692 9.99242 2.80308 9.99242 3.02275 9.77275L6 6.79549L8.97725 9.77275C9.19692 9.99242 9.55308 9.99242 9.77275 9.77275C9.99242 9.55308 9.99242 9.19692 9.77275 8.97725L6.79549 6L9.77275 3.02275Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <svg
          class="relative w-20 h-20 z-10"
          id="Layer_1"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 316.55 316.54"
        >
          <defs></defs>
          <path
            fill="currentColor"
            fill-rule="evenodd"
            d="m158.27,0C70.86,0,0,70.86,0,158.27s70.86,158.27,158.27,158.27,158.27-70.86,158.27-158.27S245.68,0,158.27,0Zm54.1,67.35c-15.29-14.95-40.61-17.23-62.16-13.51-22.5,3.89-46.84,15.16-63.19,34.73-21.17,25.21-26.64,61.4-21.09,92.74,5.51,31.13,22.94,62.68,53.72,74.72l.14.05c48.1,18.29,114.1-15,138.37-81.03,3.03-8.25-1.2-17.39-9.44-20.42-8.25-3.03-17.39,1.2-20.42,9.44-19.85,54-69.84,72.6-97.13,62.29-16.47-6.48-29.46-25.48-33.9-50.6-4.41-24.92.65-50.7,14.14-66.75l.03-.04c10.45-12.51,27.3-20.87,44.19-23.79,17.84-3.08,30.12.65,34.48,4.89.53.53,1.59,2.02,2,5.94.41,3.95-.01,9.03-1.21,14.81-2.4,11.58-7.23,22.75-9.24,26.67-2.37,4.6-6.89,12.84-12.81,19.64-6.38,7.32-11.19,9.38-14.02,9.3-1.63-.12-3.23-.55-4.7-1.27-1.51-.74-2.86-1.77-3.97-3.03-1.11-1.26-1.97-2.73-2.51-4.32-.55-1.59-.77-3.27-.67-4.95.1-1.68.54-3.32,1.28-4.83.74-1.51,1.77-2.86,3.03-3.97,1.26-1.11,2.73-1.97,4.32-2.51,1.59-.55,3.27-.77,4.95-.67,8.77.55,16.32-6.12,16.87-14.89.55-8.77-6.12-16.32-14.89-16.87-5.85-.37-11.71.42-17.26,2.33-5.54,1.9-10.66,4.87-15.05,8.75-4.39,3.88-7.98,8.58-10.56,13.85-2.58,5.26-4.09,10.98-4.46,16.83-.37,5.85.42,11.71,2.32,17.26,1.9,5.54,4.87,10.66,8.75,15.05,3.88,4.39,8.58,7.98,13.85,10.56,5.26,2.58,10.98,4.09,16.83,4.46h.23c18.1.88,31.66-11,39.65-20.17,8.52-9.79,14.45-20.82,17.1-25.96,3-5.83,8.99-19.73,12.11-34.77,1.56-7.53,2.57-16.15,1.7-24.55-.87-8.41-3.79-17.94-11.36-25.37l-.02-.02Z"
          />
        </svg>

        <div
          class="md:w-[100px] w-[50px] relative before:content-[''] before:w-[60%] before:absolute before:left-1/2 before:-translate-x-1/2 before:h-[65%] before:top-1/2 before:rounded-full before:-translate-y-1/2 before:bg-white"
        ></div>

        <div>
          <p class="text-base md:text-lg font-medium text-[#F0F0F0]">
            Connect Account
          </p>
        </div>
      </div>

      <div
        class="bg-white flex-1 md:basis-[60%] flex h-full items-center justify-center rounded-[14px] md:rounded-[24px]"
      >
        <div class="p-4">
          <div>
            <h1 class="text-[#1E1E1E] text-lg md:text-xl font-semibold mb-2">
              Connect Tokenbound Account
            </h1>
            <p class="text-[#7E7E7E] text-xs md:text-sm">
              Provide your Tokenbound account address and select its parent
              wallet.
            </p>
          </div>
          <div class="md:mt-8 mt-4 flex flex-col gap-4 md:gap-6">
            <label for="tba-address" class="relative block">
              <span class="sr-only">Tokenbound Account address</span>
              <input
                type="text"
                placeholder="Account address"
                id="tba-address"
                name="address"
                value={options.address}
                on:input={handleChange}
                aria-invalid={!!errors.address}
                aria-describedby="address-error"
                class={`w-full border text-sm bg-white text-black font-normal rounded-[4px] px-3 py-2 mb-1 placeholder:text-gray-500 focus:outline-none focus:border-gray-500 ${errors.address ? "border-red-500" : "border-[#C7C7C7]"}`}
              />
              {#if errors.address}
                <p
                  id="address-error"
                  role="alert"
                  class="text-red-500 absolute -top-4 right-2 text-xs"
                  aria-live="assertive"
                >
                  {errors.address} *
                </p>
              {/if}
            </label>

            <div class="relative">
              <label for="parentWallet" class="sr-only">Parent Wallet</label>
              <div
                class={`w-full border text-sm bg-white text-black font-normal rounded-[4px] px-3 py-2 mb-1 placeholder:text-gray-500 focus-within:outline-none focus-within:border-gray-500 ${errors.parentWallet ? "border-red-500" : "border-[#C7C7C7]"}`}
              >
                <select
                  id="parentWallet"
                  name="parentWallet"
                  value={options.parentWallet}
                  on:change={handleSelectChange}
                  aria-invalid={!!errors.parentWallet}
                  aria-describedby="wallet-error"
                  class="w-full h-full focus:outline-none"
                >
                  <option value="" disabled>Select parent wallet</option>
                  {#each wallets as { id, label }}
                    <option value={id} class="capitalize">{label}</option>
                  {/each}
                </select>
              </div>
              {#if errors.parentWallet}
                <p
                  id="wallet-error"
                  role="alert"
                  class="text-red-500 absolute -top-4 right-2 text-xs"
                  aria-live="assertive"
                >
                  {errors.parentWallet} *
                </p>
              {/if}
            </div>
          </div>

          <div class="w-full mt-4 md:mt-8">
            <button
              on:click={handleSubmit}
              class="w-full text-[#F9F9F9] bg-[#272727] rounded-lg text-sm md:text-base border-[#272727] outline-none p-2"
            >
              Connect account
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
