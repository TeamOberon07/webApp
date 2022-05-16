import React from "react";

export function SwitchNetwork({ switchNetwork }) {
  return (
    <div id="connectWallet">
      <p>Please connect to Ethereum Rinkeby Testnet</p>
      <button
        className="cta-button basic-button blur"
        type="button"
        onClick={switchNetwork}
      >
      Switch Network
      </button>
    </div>
  );
}