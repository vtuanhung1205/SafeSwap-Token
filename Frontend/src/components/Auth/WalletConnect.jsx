import React from "react";
import { Button } from "antd";
import { WalletOutlined } from "@ant-design/icons";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const WalletConnect = () => {
  return (
    <div>
      <WalletSelector />
    </div>
  );
};

export default WalletConnect; 