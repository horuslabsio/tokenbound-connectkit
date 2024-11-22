const applyModalStyle = (iframe: HTMLIFrameElement) => {
  // middle of the screen
  iframe.style.position = "fixed"
  iframe.style.top = "50%"
  iframe.style.left = "50%"
  iframe.style.transform = "translate(-50%, -50%)"
  iframe.style.width = "100vw"
  iframe.style.height = "100vh"
  iframe.style.backgroundColor = "transparent"
  iframe.style.border = "none"
  iframe.style.opacity = "0"
  iframe.style.transition = "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)"

  const background = document.createElement("div")
  background.style.display = "none"
  background.style.position = "fixed"
  background.style.top = "0"
  background.style.left = "0"
  background.style.right = "0"
  background.style.bottom = "0"
  background.style.transition =
    "backgroundColor 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  background.style.zIndex = "99999"

  background.appendChild(iframe)

  setTimeout(() => {
    background.style.backgroundColor = "rgba(0,0,0,0.6)"
    iframe.style.opacity = "1"
  }, 500)

  return background
}

export const showModal = (modal: HTMLDivElement) => {
  modal.style.display = "block"
}

export const hideModal = (modal: HTMLDivElement) => {
  modal.style.display = "none"
}

export const setIframeHeight = (modal: HTMLIFrameElement, height: number) => {
  modal.style.height = `min(${height || 420}px, 100%)`
}

export const setIframeWidth = (modal: HTMLIFrameElement, height: number) => {
  modal.style.width = `min(${height || 380}px, 100%)`
}

export const setIframeSize = (
  modal: HTMLIFrameElement,
  width: number,
  height: number,
) => {
  modal.style.width = `min(${width || 480}px, 100%)`
  modal.style.height = `min(${height || 320}px, 100%)`
}

export const createModal = async (targetUrl: string, shouldShow: boolean) => {
  // make sure target url has always /iframes/comms as the path
  const url = new URL(targetUrl)
  targetUrl = url.toString()
  const iframe = document.createElement("iframe")
  iframe.src = targetUrl
  ;(iframe as any).loading = "eager"
  iframe.sandbox.add(
    "allow-scripts",
    "allow-same-origin",
    "allow-forms",
    "allow-modals",
    "allow-top-navigation",
    "allow-popups",
  )
  iframe.allow = "clipboard-write"
  iframe.id = "tokenbound-account-iframe"

  const modal = applyModalStyle(iframe)
  modal.style.display = "block"
  modal.id = "tokenbound-account-modal"

  // append the modal to the body
  window.document.body.appendChild(modal)
  //close modal
  window.document.body.addEventListener("click", () => hideModal(modal))
  // wait for the iframe to load
  await new Promise<void>((resolve, reject) => {
    const pid = setTimeout(
      () => reject(new Error("Timeout while loading an iframe")),
      20000,
    )

    iframe.addEventListener("load", async () => {
      clearTimeout(pid)
      resolve()
    })
  })

  return { iframe, modal }
}
