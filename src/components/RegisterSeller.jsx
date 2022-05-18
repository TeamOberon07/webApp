import React, { useContext, useEffect } from "react";

import { Header } from './Header';
import { Error } from "./Error";
import { StateContext } from './StateContext';
import { Loading } from "./Loading";

export function RegisterSeller() {

    const context = useContext(StateContext);
  
    useEffect(() => {
        context._connectWallet();
        context._setListenerMetamaskAccount();
    }, []);

    const _registerSeller = async () => {
        try {
            console.log("CI SONO")
            const tx = await context._contract.registerAsSeller();
            await tx.wait();
            window.location.href = '/';
        } catch(err) {
            <Error message={err}/>;
        }
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
