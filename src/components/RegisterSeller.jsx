import React from "react";

import { Header } from './Header';
import { Error } from "./Error";
import { StateContext } from './StateContext';

export class RegisterSeller extends React.Component {

  static contextType = StateContext;
  
  componentWillUnmount() {
    this.context.state = this.context.initialState;
  }
  
  componentDidMount() {
    this.context._connectWallet();
    this.context._setListenerMetamaksAccount();
  }

  render() {
    return (
      <div>
        <Header currentAddress={this.context.currentAddress}
                balance={this.context.balance}
        />
        <div className="container">
          <div className="box register-seller">
            <h2>Register to our platform as a Seller</h2>
            <button onClick={() => this._registerSeller()} className="cta-button basic-button register-button blur">Register</button>
          </div>
        </div>
      </div>
    );
  }

  // EDITATA, DA TESTARE
  async _refreshInfo(tx) {
    const receipt = await tx.wait();
    if (receipt.status) {
      this.context._connectWallet();
    }
  }
  
  async _registerSeller() {
    try {
        const tx = await this.context._contract.registerAsSeller();
        await this._refreshInfo(tx);
        window.location.href = '/';
    } catch(err) {
        <Error message={err}/>;
    }
  }
}
