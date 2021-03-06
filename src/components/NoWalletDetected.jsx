import React from "react";

export function NoWalletDetected() {
  //componente di errore: nessun gestore di wallet trovato
  //+consiglio e link per scaricare MetaMask
  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col-6 p-4 text-center">
          <p role="hint">
            No Ethereum wallet was detected. <br />
            Please install{" "}
            <a href="http://metamask.io" target="_blank" rel="noopener noreferrer">
              MetaMask
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}