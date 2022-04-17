import React from "react";

import { Header } from './Header';
import { StateContext } from "./StateContext";
import {useLocation} from 'react-router-dom'


export function OrderPage () {
    const location = useLocation();
    const id = location.state.myState;
    return (<div>
                <Header currentAddress={StateContext.currentAddress}
                balance={StateContext.balance}
                />
                <div className = "order-container">
                    <h2>ID: {id}</h2>
                </div>
            </div>
    );
}