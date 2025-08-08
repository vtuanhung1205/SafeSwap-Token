import type {
  AccountInfo,
  AdapterPlugin,
  SignMessagePayload,
  SignMessageResponse,
  WalletName,
} from "@aptos-labs/wallet-adapter-core";
import { NetworkName, PluginProvider, } from "@aptos-labs/wallet-adapter-core";
import { Types } from "aptos";

export type NetworkInfo = {
  api?: string;
  chainId?: string;
  name: NetworkName | undefined;
};

interface RiseProvider extends Omit<PluginProvider, "onNetworkChange" | "network"> {
  onNetworkChange(listener: (network: NetworkInfo) => void): Promise<void>;
  signTransaction(transaction: Types.TransactionPayload, options?: any): Promise<Uint8Array>;
  network(): Promise<NetworkInfo>;
}
interface RiseWindow extends Window {
  rise?: RiseProvider;
}

declare const window: RiseWindow;

export const RiseWalletName = "Rise" as WalletName<"Rise">;

export class RiseWallet implements AdapterPlugin {
  readonly name = RiseWalletName;
  readonly url =
    "https://chrome.google.com/webstore/detail/rise-aptos-wallet/hbbgbephgojikajhfbomhlmmollphcad";
  readonly icon =
    "data:image/png;base64,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";

  provider: RiseProvider | undefined =
    typeof window !== "undefined" ? window.rise : undefined;

  async connect(): Promise<AccountInfo> {
    try {
      const accountInfo = await this.provider?.connect();
      if (!accountInfo) {
        throw `${RiseWalletName} Address Info Error`;
      }

      return accountInfo;
    } catch (error: any) {
      throw error;
    }
  }

  async account(): Promise<AccountInfo> {
    const response = await this.provider?.account();
    if (!response) throw `${RiseWalletName} Account Error`;
    return response;
  }

  async disconnect(): Promise<void> {
    try {
      await this.provider?.disconnect();
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const response = await this.provider?.signAndSubmitTransaction(
        transaction,
        options
      );

      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      throw error.message;
    }
  }

  async signTransaction(transaction: Types.TransactionPayload): Promise<Uint8Array> {
    try {
      const response = await this.provider?.signTransaction(transaction);
      if (!response) {
        throw `${RiseWalletName} Sign Transaction failed`;
      }

      return response;
    } catch (error: any) {
      throw error.message;
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      if (typeof message !== "object" || !message.nonce) {
        `${RiseWalletName} Invalid signMessage Payload`;
      }
      const response = await this.provider?.signMessage(message);
      if (!response) {
        throw `${RiseWalletName} Sign Message failed`;
      }

      return response;
    } catch (error: any) {
      throw error.message;
    }
  }

  async network(): Promise<NetworkInfo> {
    try {
      const response = await this.provider?.network() as any;
      if (!response) {
        throw `${RiseWalletName} Network Error`;
      }

      return {
        name: response.name,
        api: response.api,
        chainId: response.chainId
      };
    } catch (error: any) {
      throw error;
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    try {
      const handleNetworkChange = async (network: NetworkInfo): Promise<void> => {
        callback({
          name: network.name,
          chainId: network.chainId,
          api: network.api,
        });
      };
      await this.provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      return error.message;
    }
  }

  async onAccountChange(callback: any): Promise<void> {
    try {
      const handleAccountChange = async (
        newAccount: AccountInfo
      ): Promise<void> => {
        if (newAccount?.publicKey) {
          callback({
            publicKey: newAccount.publicKey,
            address: newAccount.address,
          });
        } else {
          const response = await this.connect();
          callback({
            address: response?.address,
            publicKey: response?.publicKey,
          });
        }
      };
      await this.provider?.onAccountChange(handleAccountChange);
    } catch (error: any) {
      console.log(error);
      throw error.message;
    }
  }
}
