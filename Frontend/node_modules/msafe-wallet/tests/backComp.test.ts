import {Account, adaptLegacyAccount, LegacyAccount, Option, Payload, toLegacyAccount, WalletAPI} from "../src";

const fakeAccount: Account = {
  publicKey: ["0x01", "0x02", "0x03"],
  address: "0x123",
  minKeysRequired: 3,
  authKey: "0x456",
}

const fakeLegacyAccount: LegacyAccount = {
  publicKey: "0x01020303",
  address: "0x123",
}

const fakeLatestWalletAPI: WalletAPI = {
  async connect(): Promise<Account> {return fakeAccount},
  async disconnect(): Promise<void> {},
  async isConnected(): Promise<boolean> {return true},
  async network(): Promise<string> {return 'unit test'},
  async account(): Promise<Account> {return fakeAccount},
  async chainId(): Promise<Number> {return 1234},
  async signAndSubmit(payload: Payload, option?: Option): Promise<Uint8Array> {return new Uint8Array(64)},
  async signTransaction(payload: Payload, option?: Option): Promise<Uint8Array> {return new Uint8Array(64)},
  async signMessage(message: string | Uint8Array): Promise<Uint8Array> {return new Uint8Array(64)},
}

describe('LegacyWalletAPI', () => {

  it('legacy compatibility', async () => {
    const legacyWA = adaptLegacyAccount(fakeLatestWalletAPI);
    expect(await legacyWA.account()).toEqual(fakeLegacyAccount);
  })

})

describe('toLegacyAccount', () => {

  it('toLegacyAccount', () => {
    expect(toLegacyAccount({
      publicKey: ["0x01", "0x02", "0x03"],
      address: "0x123",
      minKeysRequired: 3,
      authKey: "0x456",
    })).toEqual({
      address: "0x123",
      publicKey: '0x01020303',
    })

    expect(toLegacyAccount({
      publicKey: [
        "0x01", "0x02", "0x03", "0x04", "0x05", "0x06", "0x07", "0x08", "0x09", "0x0a", "0x0b",
        "0x0c", "0x0d", "0x0e", "0x0f", "0x10",
      ],
      address: "0x123",
      minKeysRequired: 16,
      authKey: "0x456",
    })).toEqual({
      address: "0x123",
      publicKey: "0x0102030405060708090a0b0c0d0e0f1010",
    })
  })

})
