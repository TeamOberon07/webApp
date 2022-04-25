import React, { useContext } from "react";
import { Header } from './Header';
import { StateContext } from "./StateContext";
import { useLocation } from 'react-router-dom'

export function OrderPage () {
    const context = useContext(StateContext);
    const location = useLocation();
    const id = location.state.id;
    const amount = location.state.amount;
    const orderState = location.state.orderState;
    return (<div>
                <Header currentAddress={context.currentAddress}
                balance={context.balance}
                />
                <div className = "order-container">
                    <h2>ID: {id}</h2>
                    <h2>Amount: {amount}</h2>
                    <h2>State: {orderState}</h2>
                </div>
                {(() => {
                    //TO DO: vista Buyer
                    if (context.userIsSeller) {
                       return (
                        <div className="content-and-qrcode">
                            <div className="box top">
                                <h2>Seller View</h2>
                                
                                {(() => {
                                    if (orderState === "Created" || orderState === "Shipped") {
                                        return (
                                            <form onSubmit={(event) => {
                                                event.preventDefault();
                                                    if(id)
                                                        context._orderOperation(id, "Delete", 0);
                                            }}>
                                                <div className="button-label-select">
                                                    <input className="cta-button basic-button blur" type="submit" value="Delete Order" />
                                                    <label className="label-selectBox">Order to delete:</label>
                                                    <select id="orderIDs" name="orderIDs" className="blur">
                                                    <option value={id}>{id}</option>
                                                    </select>
                                                </div>
                                            </form>
                                        );
                                    }
                                })()}
                                
                                {(() => {
                                    if (orderState === "Refund Asked") {
                                        return(
                                            <form onSubmit={(event) => {
                                                event.preventDefault();
                                                if(id)
                                                    context._orderOperation(id, "RefundBuyer", 1);
                                            }}>
                                            <div className="button-label-select">
                                                <input className="cta-button basic-button blur" type="submit" value="Refund Order"/>
                                                <label className="label-selectBox">Order to refund:</label>
                                                <select id="orderIDs" name="orderIDs" className="blur">
                                                <option value={id}>{id}</option>
                                                </select>
                                            </div>
                                        </form>
                                        );
                                    }
                                })()}
                                
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    if(id)
                                        context._getQRCode(id);
                                }}>
                                    <div className="button-label-select">
                                        <input className="cta-button basic-button blur" type="submit" value="Get QRCode" />
                                        <label className="label-selectBox">Order to get QRCode:</label>
                                        <select id="orderIDs" name="orderIDs" className="blur">
                                        <option value={id}>{id}</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div id="qrcode-container" className="blur">
                                <h2>QRCode</h2>
                                <canvas id="qrcode"></canvas>
                            </div>
                        </div>
                       ); 
                    }
                  })()}
            </div>
    );
}