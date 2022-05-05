import React, { useContext } from "react";
import { ethers } from "ethers";
import { Header } from './Header';
import { StateContext } from "./StateContext";
import { useLocation } from 'react-router-dom'
import { Button } from "./Button";

export function OrderPage () {
    const context = useContext(StateContext);    
    const order = useLocation().state.order;
    const id = parseInt(order[0]._hex);
    const amount = order[3];
    const orderState = useLocation().state.orderState;
   
    return (<div>
            <Header currentAddress={context.currentAddress}
                balance={context.balance}
            />
            <div id="order-page-container">
            {(() => {
                if (context.userIsSeller)
                    return <p id="orderPageAddress">Buyer Address: <span className="address">{order[1]}</span></p>
                else
                    return <p id="orderPageAddress">Seller Address: <span className="address">{order[2]}</span></p>
            })()}
                <div className = "order-container">
                    <p>ID: {id}</p>
                    <p>Amount: {ethers.utils.formatEther(amount)}</p>
                    <p>State: {orderState}</p>
                    
                </div>
                {(() => {
                    if (context.userIsSeller) {     //vista Seller
                        var comp = (
                            <div className="content-and-qrcode">
                                <div className="box top actions">         
                                    {(() => {
                                        if (orderState === "Created" || orderState === "Shipped")
                                            return <Button  method = {(id) => context._orderOperation(id, "Delete")}
                                                            id = {id}
                                                            text = {"Delete"}
                                                    />;
                                    })()}

                                    {(() => {
                                        if (orderState === "Created")
                                            return <Button  method = {(id) => context._orderOperation(id, "SetAsShipped")}
                                                            id = {id}
                                                            text = {"Set as Shipped"}
                                                    />;
                                    })()}
                                    
                                    {(() => {
                                        if (orderState === "Asked Refund")
                                            return <Button  method = {(id, amount) => context._orderOperation(id, "RefundBuyer", amount)}
                                                            id = {id}
                                                            text = {"Refund"}
                                                            amount = {amount}
                                                    />;
                                    })()}

                                    <button
                                        className="cta-button basic-button blur"
                                        type="button"
                                        onClick={() =>  context._getQRCode(order)}
                                    >Set as Shipped</button>
                                    {/*<Button method = {() =>  context._getQRCode(order)}
                                            id = {id}
                                            text = {"Get QRCode"}
                                    />}*/}
                                </div>
                                <div id="qrcode-container" className="blur">
                                    <h2>QRCode</h2>
                                    <canvas id="qrcode"></canvas>
                                </div>
                            </div>
                    ); 
                    console.log("qualcsoa");
                    return comp;
                    } else {        //vista Buyer
                        return (
                            <div className="content-and-qrcode">
                                <div className="box top actions-buyer">
                                    {(() => {
                                        if (orderState === "Created" || orderState === "Shipped" || orderState === "Confirmed") {
                                            return <Button  method={(id) => context._orderOperation(id, "AskRefund")}
                                                            id = {id}
                                                            text = {"Ask refund"}
                                                    />;
                                        }
                                    })()}
                                </div>
                            </div>
                        );
                    }
                })()}
            </div>
        </div>
    );
}