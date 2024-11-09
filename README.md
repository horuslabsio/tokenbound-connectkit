## 🕹️ Tokenbound ConnectKit

Houses the Tokenbound Connectkit.

The Tokenbound Connectkit enables users connect to existing Starknet dApps with their Tokenbound accounts.

## Installation

Install tokenbound connectkit with `npm`, `pnmp` or `yarn`

```bash
$  npm install tokenbound-connectkit

# or with yarn:
$ yarn add tokenbound-connectkit
```

## Imports

After installation, we get access to different methods, such as `connect`, `disconnect`, etc which we should import for use in our application:

```js
import { connect, disconnect } from "tokenbound-connectkit"
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

## Disconnect a wallet

```js
await disconnect()
```

## 📕 Guides

Guides can be found [here]()

## 📜 License

Copyright (c) 2024

Licensed under the [MIT license](./LICENSE.md).
