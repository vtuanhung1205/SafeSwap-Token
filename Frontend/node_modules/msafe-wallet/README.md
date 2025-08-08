# MSafe Wallet SDK

[![codecov](https://codecov.io/gh/Momentum-Safe/msafe-wallet/branch/main/graph/badge.svg?token=CYM8HWWKOW)](https://codecov.io/gh/Momentum-Safe/msafe-wallet)

MSafe Wallet SDK is used to integrate any dapp into msafe multi-sign wallet.  
The frontend of dapp will run in an iframe under the msafe website, this SDK can be used for the interaction between dapp and msafe wallet.

This SDK wraps the msafe wallet and exposes a set of easy-to-use wallet interfaces. We are also working on integrating our SDK into aptos-wallet-adaptor, so that you can access our wallet through aptos-wallet-adaptor.

Two way to integrate msafe wallet to your dapp:
- use msafe wallet SDK directly: [Use MSafe Wallet SDK]
- use aptos-wallet-adaptor: [Use Aptos Wallet Adaptor]

## Installation

Installation of the [npm package]:

```bash
npm install --save msafe-wallet
```

## Detecting the MSafe Wallet environment
To use msfe wallet, the dapp website must be running in an iframe under the msafe website.
There are two way to detect if the dapp is running in msafe:
- Check if the `MSafeWallet.inMSafeWallet()` return true.
- Check if the current url contains the parameter `msafe=true`.

If the msafe wallet environment is detected, you can automatically connect to the msafe wallet at initialization.

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const inMSafeWallet = window.location.search.includes('msafe=true');
if(!MSafeWallet.inMSafeWallet()){ // check if the dapp is running in msafe
    const url = MSafeWallet.getAppUrl('Testnet'); // get dapp url for msafe
    window.location.href.replace(url); // redirect to msafe dapp
}
```

## Use MSafe Wallet SDK
### Init msafe wallet
You should initialize it once and use it later.

> **To use msafe wallet, the dapp must run in msafe website.**

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
if(!MSafeWallet.inMSafeWallet()){ // check if the dapp is running in msafe
    const url = MSafeWallet.getAppUrl('Testnet'); // get dapp url for msafe
    window.location.href.replace(url); // redirect to msafe dapp
}
const msafe = await MSafeWallet.new('Testnet');
```

### Connect to a msafe account
This method is used to connect to current account. It returns an account object containing the `address` and `publicKey`.

> **In the current implementation, accounts are always connected, and disconnect is not supported.**

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const msafe = await MSafeWallet.new('Testnet');
const account = await msafe.connect(); // {addres:string, publicKey:string}
await msafe.isConnected(); // true
```

### Get Network
This method is used to get current network. It returns a string.

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const msafe = await MSafeWallet.new('Testnet');
const network:string = await msafe.network(); // 'Testnet'
```

### Get Account
This method is used to get current msafe account. It returns an account object containing the `address` and `publicKey`.

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const msafe = await MSafeWallet.new('Testnet');
const account:Account = await msafe.account();
console.log("address:", account.address);
console.log("public key:", account.publicKey);
```

### Get ChainId
This method is used to get current ChainId. It returns a number.

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const msafe = await MSafeWallet.new('Testnet');
const account = await msafe.chainId();  // 1
```

### Submit Transaction
This method is used to sign the transaction and then submit it to the blockchain.  
It takes two parameters:
- `payload` - mandatory parameter containing the transaction body.
  - For arguments of type vector, you can pass in an array.
  - For `vector<u8>`, you can pass in `Uint8Array`.
  - You can also pass in a BCS serialized transaction as payload(`Uint8Array`), which ignores option.
- `option` - optional parameter that overrides transaction parameters.


> **In current implementation, this method call never returns. This is because when a transaction is initiated, the dapp page will be closed and then the msafe page will be entered to collect signatures. We will optimize it in future releases.**

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const msafe = await MSafeWallet.new('Testnet');
const payload = {
    type: "entry_function",
    function: "0x1::coin::transfer",
    type_arguments: ["0x1::aptos_coin::AptosCoin"],
    arguments: ["0x997b38d2127711011462bc42e788a537eae77806404769188f20d3dc46d72750", 50]
};
// each field of option is optional.
const option = {
   sender: account.address,
   sequence_number: "1",
   max_gas_amount: "4000",
   gas_unit_price: "100",
   // Unix timestamp, in seconds + 30 days
   expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + 30*24*3600).toString(),
}
await msafe.signAndSubmit(payload, option);
```

### Sign Transaction
Not supported for now.

### Sign Message
Not supported for now.

### Network Change Event
This method is used to register the callback function for the network change event.

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const msafe = await MSafeWallet.new('Testnet');
msafe.onChangeAccount((network:string)=>{
    console.log("network change to:", network)
});
```

### Account Change Event
This method is used to register the callback function for the account change event.

Example:
```typescript
import { MSafeWallet } from "msafe-wallet";
const msafe = await MSafeWallet.new('Testnet');
msafe.onChangeAccount((account:Account)=>{
    console.log("address:", account.address);
    console.log("public key:", account.publicKey);
});
```

## Use Aptos Wallet Adaptor
The wallet adapter helps you to integrate many different wallets at once and use the same interface to interact with any supported wallet.

Here we give an example of using msafe wallet with the adaptor. For more details, see: https://github.com/hippospace/aptos-wallet-adapter.

### Install wallet adapter

```bash
npm install @manahippo/aptos-wallet-adapter
```

### Create wallet adapter
Example:
```typescript
import {
    WalletProvider,
    MSafeWalletAdapter,
} from "@manahippo/aptos-wallet-adapter";

const wallets = [
    new MSafeWalletAdapter('Testnet'),
];
```

### Use wallet adapter
Example:
```tsx
import React from "react";
import {
    WalletProvider,
    MSafeWalletAdapter,
} from "@manahippo/aptos-wallet-adapter";

const wallets = [
    new MSafeWalletAdapter('Testnet'),
];

const App: React.FC = () => {
  return (
    <WalletProvider
      wallets={wallets}
      onError={(error: Error) => {
        console.log('Handle Error Message', error)
      }}>
      {/* your website */}
    </WalletProvider>
  );
};

export default App;
```

### Use wallet adapter hooks
Example:
```tsx
import { useWallet, MSafeWalletName } from "@manahippo/aptos-wallet-adapter";

const WalletName = MSafeWalletName;

export function DAPP() {
    const {
        account,
        connected,
        wallet,
        network,
        connect,
        disconnect,
        select,
        signAndSubmitTransaction,
    } = useWallet();
}
```

### Use msafe wallet with wallet adapter hooks

> **In current implementation, the function `signAndSubmitTransaction` never returns. This is because when a transaction is initiated, the dapp page will be closed and then the msafe page will be entered to collect signatures. We will optimize it in future releases.**

Example:
```tsx
import { useWallet, MSafeWalletName } from "@manahippo/aptos-wallet-adapter";

const WalletName = MSafeWalletName;

export function DAPP() {
    const {
        connect,
        signAndSubmitTransaction,
    } = useWallet();

    return (
        <>
            <button onClick={()=>{connect(WalletName)}}> Connect </button>
            <button onClick={()=>{
                const payload = {
                    type: "entry_function",
                    function: "0x1::coin::transfer",
                    type_arguments: ["0x1::aptos_coin::AptosCoin"],
                    arguments: ["0x997b38d2127711011462bc42e788a537eae77806404769188f20d3dc46d72750", 50]
                };
                // each field of option is optional.
                const option = {
                   sequence_number: "1",
                   max_gas_amount: "4000",
                   gas_unit_price: "100",
                   // Unix timestamp, in seconds + 30 days
                   expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + 30*24*3600).toString(),
                }
                signAndSubmitTransaction(payload, option);
            }}> SignAndSubmit </button>
        </>
    );
}
```

## Usage(MSafe Server Side)
This section is for implementation on the msafe server side and is intended for use only by the msafe developers themselves.
### Accept dapp connection

Example:
```typescript
import { Connector,MSafeServer } from "msafe-wallet";
// cleaner is a function that used to remove listener.
const cleaner = Connector.accepts(dappUrl, (connector:Connector) => {

})
```
### Create MSafe Wallet Service

Example:
```typescript
import { Connector,MSafeServer,WalletAPI } from "msafe-wallet";
const connector:Connector = await Connector.accept(dappUrl);
const server = new MSafeServer(connector, {
    async connect(): Promise<Account> {
        // ...
        return {address:'0x1', publicKey:'0x1234...'};
    },
    // ... signAndSubmit(),signTransaction()
    async signMessage(
        message: string | Uint8Array
    ): Promise<Uint8Array> {
        throw Error("unsupport");
    },
} as WalletAPI);
```
### Emit Network Change Event

Example:
```typescript
import { Connector,MSafeServer,WalletAPI } from "msafe-wallet";
const server = new MSafeServer(...);
await server.changeNetwork('Testnet');
```
### Emit Account Change Event

Example:
```typescript
import { Connector,MSafeServer,WalletAPI } from "msafe-wallet";
const server = new MSafeServer(...);
await server.changeAccount({address:'0x1234...', publicKey:'0xabce...'});
```


## Development

```
# Install dependencies
> npm install

# Build
> npm run build

# Test
> npm run test

# Publish
> npm publish
```

[npm package]: https://www.npmjs.com/package/msafe-iframe
[Use MSafe Wallet SDK]: #use-msafe-wallet-sdk
[Use Aptos Wallet Adaptor]: #use-aptos-wallet-adaptor