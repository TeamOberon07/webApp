import React from "react";

//componente che richiede il cambio del Network ed offre un bottone che lo fa in automatico
export function SwitchNetwork({ switchNetwork }) {
  return (
    <div id="connectWallet">
      <p>Please connect to Ethereum Rinkeby Testnet</p>
      <button className="cta-button basic-button blur" type="button" onClick={switchNetwork}>
        Switch Network
      </button>
    </div>
  );
}