<!-- logo -->
<p align="center">
  <img width='300' src="https://starknetkit-website-git-blo-1541-argentlabs.vercel.app/starknetKit-logo.svg">
</p>

<!-- primary badges -->
<p align="center">
  <a href="https://www.npmjs.com/package/starknetkit">
    <img src='https://img.shields.io/npm/v/starknetkit' />
  </a>
  <a href="https://bundlephobia.com/package/starknetkit">
    <img src='https://img.shields.io/bundlephobia/minzip/starknet?color=success&label=size' />
  </a>
  <a href="https://www.npmjs.com/package/starknetkit">
    <img src='https://img.shields.io/npm/dt/starknetkit?color=blueviolet' />
  </a>
  <a href="https://github.com/argentlabs/starknetkit/blob/main/LICENSE/">
    <img src="https://img.shields.io/badge/license-MIT-black">
  </a>
</p>

## 🕹️ TokenboundConnectorKit

Install tokenbound connectorKit with `npm`, `pnmp` or `yarn`

```bash
$ npm install tokenbound-connector

# or with yarn:
$ yarn add tokenbound-connector
```

## Imports

After installation, we get access to different methods, such as `connect`, `disconnect`, etc which we should import for use in our application:

```js
import { connect, disconnect } from "tokenbound-connector"
```

## Establishing a connection

To establish a wallet connection, we need to call the connect method which was imported earlier like this:

```js
const wallet = await connect()
```

```js
const connectTBA = async () => {
   try {
     const { wallet } = await connect({
       tokenboundOptions: {
         chainId: constants.NetworkName.SN_SEPOLIA,
       }
     });
   } catch (e) {
     console.error(e)
     alert((e as any).message)
   }
 }


```

## Reconnect to a previously connected wallet on load:

```js
const wallet = await connect({ modalMode: "neverAsk" })
```

## Disconnect a wallet

```js
await disconnect({ clearLastWallet: true })
```


```

## 📕 Guides

Guides can be found [here]()

## 📜 License

Copyright (c) 2024

Licensed under the [MIT license](./LICENSE.md).
