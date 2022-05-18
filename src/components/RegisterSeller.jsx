import React, { useContext, useEffect } from "react";

import { Header } from './Header';
import { Error } from "./Error";
import { StateContext } from './StateContext';
import { Loading } from "./Loading";
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { SwitchNetwork } from "./SwitchNetwork";

export function RegisterSeller() {

    const context = useContext(StateContext);
  
    useEffect(() => {
        context._connectWallet();
        context._setListenerMetamaskAccount();
        context._setListenerNetworkChanged();
    }, []);

    const _registerSeller = async () => {
        try {
            const tx = await context._contract.registerAsSeller();
            await tx.wait();
            window.location.href = '/';
        } catch(err) {
            <Error message={err}/>;
        }
    }

    if (window.ethereum === undefined) {
        return <NoWalletDetected/>;
    }
    
    if (!context.currentAddress) {
        return <ConnectWallet connectWallet={async () => await context._connectWallet()}/>;
    }

    if (window.ethereum.chainId !== context.networks[context.ourNetwork].chainId || !context.rightChain) {
        return <SwitchNetwork switchNetwork={async () => await context._changeNetwork(context.ourNetwork)}/>;
    }

    if(context.currentAddress) {
        return (
            <div>
                <Header/>
                <div className="container">
                    <div className="box register-seller">
                        <h2>Register to our platform as a Seller</h2>
                        <button onClick={() => _registerSeller()} className="cta-button basic-button register-button blur">Register</button>
                    </div>
                </div>
            </div>
        );
    } else
        return <Loading/>;

}
