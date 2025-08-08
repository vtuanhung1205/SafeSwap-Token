import {Connector} from "./connector";
import {JsonRPCServer} from "./JsonRPCServer";
import {Account, adaptLegacyAccount, WalletAPI, WalletEvent} from "./WalletAPI";
import {isMultiSigFormatVersion} from "./version";
import {toLegacyAccount} from "./utils";

export class MSafeServer {

  public server: JsonRPCServer;

  constructor(connector: Connector, methods: WalletAPI) {
    if (isMultiSigFormatVersion(connector.version.peer)) {
      this.server = new JsonRPCServer(connector, methods as any);
    } else {
      // backward compatibility
      const legacyWalletAPI = adaptLegacyAccount(methods);
      this.server = new JsonRPCServer(connector, legacyWalletAPI as any);
    }
  }

  changeNetwork(network: string) {
        this.server.notify(WalletEvent.ChangeNetwork, [network]);
  }

  changeAccount(account: Account) {
    const peerVersion = this.version.peer;
    if (isMultiSigFormatVersion(peerVersion)) {
      this.server.notify(WalletEvent.ChangeAccount, [account]);
    } else {
      const legacyAccount = toLegacyAccount(account);
      this.server.notify(WalletEvent.ChangeAccount, [legacyAccount]);
    }
  }

  get version() {
    return this.server.version;
  }
}


