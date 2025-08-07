import {
  APTOS_CONNECT_ACCOUNT_URL,
  AboutAptosConnect,
  AboutAptosConnectEducationScreen,
  AnyAptosWallet,
  AptosPrivacyPolicy,
  WalletItem,
  groupAndSortWallets,
  useWallet,
  isAptosConnectWallet,
} from "@aptos-labs/wallet-adapter-react";

import { useState } from "react";
import Modal from "react-modal";
import { Wallet, ExternalLink, LogOut } from "lucide-react";
import toast from "react-hot-toast";

// Set the app element for react-modal
Modal.setAppElement("#root");

interface WalletRowProps {
  wallet: AnyAptosWallet;
  onConnect?: () => void;
}

interface ConnectWalletDialogProps {
  close: () => void;
  isOpen: boolean;
}

export function WalletSelector() {
  const { account, connected, disconnect, wallet } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected successfully");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {connected ? (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-lg border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-green-600">
                  Wallet Connected
                </p>
                <p className="text-sm text-gray-600">
                  {account && `${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {wallet && isAptosConnectWallet(wallet) && (
              <a
                href={APTOS_CONNECT_ACCOUNT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Account on Aptos Connect
              </a>
            )}
            
            <button 
              onClick={handleDisconnect} 
              className="flex items-center justify-center w-full px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button 
            onClick={openModal}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            <Wallet className="w-5 h-5 inline mr-2" />
            Connect Aptos Wallet
          </button>
          <ConnectWalletDialog close={closeModal} isOpen={isModalOpen} />
        </div>
      )}
    </div>
  );
}

function AptosConnectWalletRow({ wallet, onConnect }: WalletRowProps) {
  return (
    <WalletItem wallet={wallet} onConnect={onConnect}>
      <WalletItem.ConnectButton asChild>
        <button className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center space-x-3">
            <WalletItem.Icon className="h-6 w-6" />
            <WalletItem.Name className="text-base font-medium" />
          </div>
        </button>
      </WalletItem.ConnectButton>
    </WalletItem>
  );
}

function ConnectWalletDialog({ close, isOpen }: ConnectWalletDialogProps) {
  const { wallets = [] } = useWallet();
  const { aptosConnectWallets } = groupAndSortWallets(wallets);
  const hasAptosConnectWallets = !!aptosConnectWallets.length;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={close}
      contentLabel="Connect Aptos Wallet"
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          maxWidth: "90vw",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          border: "none",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000
        }
      }}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Connect Aptos Wallet
          </h2>
          <button 
            onClick={close}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <AboutAptosConnect renderEducationScreen={renderEducationScreen}>
          {hasAptosConnectWallets ? (
            <>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Log in or sign up
                </h3>
                <p className="text-gray-600">
                  with Social + Aptos Connect
                </p>
              </div>
            </>
          ) : (
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Connect Wallet
              </h3>
            </div>
          )}
          
          {hasAptosConnectWallets && (
            <div className="space-y-4">
              {aptosConnectWallets.map((wallet) => (
                <AptosConnectWalletRow
                  key={wallet.name}
                  wallet={wallet}
                  onConnect={close}
                />
              ))}
              
              <div className="text-center space-y-3 pt-4">
                <p className="flex gap-1 justify-center items-center text-gray-500 text-sm">
                  Learn more about{" "}
                  <AboutAptosConnect.Trigger className="flex gap-1 py-1 items-center text-blue-600 hover:text-blue-700 underline">
                    Aptos Connect
                  </AboutAptosConnect.Trigger>
                </p>
                
                <AptosPrivacyPolicy className="flex flex-col items-center space-y-2">
                  <p className="text-xs text-gray-500">
                    <AptosPrivacyPolicy.Disclaimer />{" "}
                    <AptosPrivacyPolicy.Link className="text-blue-600 underline underline-offset-4" />
                    <span className="text-gray-500">.</span>
                  </p>
                  <AptosPrivacyPolicy.PoweredBy className="flex gap-1.5 items-center text-xs text-gray-500" />
                </AptosPrivacyPolicy>
              </div>
            </div>
          )}
        </AboutAptosConnect>
      </div>
    </Modal>
  );
}

function renderEducationScreen(screen: AboutAptosConnectEducationScreen) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          About Aptos Connect
        </h2>
      </div>
      
      <div className="flex h-[162px] pb-3 items-end justify-center">
        <screen.Graphic />
      </div>
      
      <div className="flex flex-col gap-2 text-center pb-4">
        <screen.Title className="text-xl font-medium text-gray-900" />
        <screen.Description className="text-sm text-gray-600 [&>a]:underline [&>a]:underline-offset-4 [&>a]:text-blue-600" />
      </div>
      
      <div className="grid grid-cols-3 items-center">
        <button 
          onClick={screen.back} 
          className="justify-self-start px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Back
        </button>
        
        <div className="flex items-center gap-2 place-self-center">
          {screen.screenIndicators.map((ScreenIndicator, i) => (
            <ScreenIndicator key={i} className="py-4">
              <div className="h-0.5 w-6 transition-colors bg-gray-300 [[data-active]>&]:bg-blue-600" />
            </ScreenIndicator>
          ))}
        </div>
        
        <button 
          onClick={screen.next} 
          className="gap-2 justify-self-end px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {screen.screenIndex === screen.totalScreens - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
