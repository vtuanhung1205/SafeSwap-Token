import {Account, LegacyAccount} from "./WalletAPI";

export function toLegacyAccount(account: Account): LegacyAccount {
  return {
    address: account.address,
    publicKey: convertPKsToMultiSigPK(account.publicKey, account.minKeysRequired),
  };
}

function convertPKsToMultiSigPK(pks: string[], threshold: number) {
  let msPk = pks.map(pk => pk.startsWith('0x') ? pk.substring(2) : pk).join('');
  msPk += threshold.toString(16).padStart(2, '0');
  return '0x' + msPk;
}