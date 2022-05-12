import React, { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { Header } from "./Header";
import { StateContext } from "./StateContext";
import { Log } from "./Log";
import tokenLogo from "../assets/usdtLogo.png";

export function OrderPage() {
    const context = useContext(StateContext);
    const order = useLocation().state.order;
    const id = parseInt(order[0]._hex);
    const amount = order[3];
    const orderState = useLocation().state.orderState;

    useEffect(() => {
        context._connectWallet();
        context._setListenerMetamaksAccount();
    }, []);

    useEffect(() => {
        if(context.userIsSeller)
            context._getQRCode(order);
    }, [order]);

    return (<div className="orderPage">
        <Header currentAddress={context.currentAddress}
            balance={context.balance}
        />
        <div className="container">
            <h1 className="page-title">Order page</h1>
            <table id="order-page-container" className="blur">
            <tbody>
                {(() => {
                    if (context.userIsSeller)
                        return <tr><th id="orderPageAddress">Buyer Address</th><td colSpan={2} className="address">{order[1]}</td></tr>
                    else
                        return <tr><th id="orderPageAddress">Seller Address</th><td className="address">{order[2]}</td></tr>
                })()}
                    <tr>
                        <th>ID</th><td>{id}</td>
                        {(() => {
                            if(context.userIsSeller)
                                return <td rowSpan={3}>
                                    <div id="qrcode-container" className="blur">
                                        <h2>QRCode</h2>
                                        <canvas id="qrcode"></canvas>
                                    </div>
                                </td>
                        })()}
                    </tr>  
                    <tr>
                        <th>Amount</th><td>${ethers.utils.formatEther(amount)}<img src={tokenLogo} id="order-page-amount-logo" className="tokenLogoMin" alt="Logo token"/></td>
                    </tr>  
                    <tr>
                        <th>State</th><td>{orderState}</td>
                    </tr>
                    {(() => {
                        if (context.userIsSeller) {     //vista Seller
                            return <tr>
                                <th>Actions</th>     
                                <td colSpan={3}>  
                                    <div className="actions">
                                        {(() => {
                                            if (orderState === "Created" || orderState === "Shipped")
                                                return <button
                                                    role="DeleteOrder"
                                                    className="cta-button basic-button blur"
                                                    type="button"
                                                    onClick={() =>  context._orderOperation(id, "Delete")}
                                                >Delete Order</button>
                                        })()}

                                        {(() => {
                                            if (orderState === "Created")
                                                return <button
                                                    role="MarkAsShipped"
                                                    className="cta-button basic-button blur"
                                                    type="button"
                                                    onClick={() =>  context._orderOperation(id, "SetAsShipped")}
                                                >Mark as Shipped</button>
                                        })()}
                                        
                                        {(() => {
                                            if (orderState === "Asked Refund")
                                                return <button
                                                    role="RefundBuyer"
                                                    className="cta-button basic-button blur"
                                                    type="button"
                                                    onClick={() =>  context._orderOperation(id, "RefundBuyer", amount)}
                                                >Refund Buyer</button>
                                        })()}

                                        {(() => {
                                            if (orderState !== "Created" &&
                                                orderState !== "Shipped" &&
                                                orderState !== "Asked Refund")
                                                return <>
                                                    <p id="none-action">You can't perform actions with this order.</p>
                                                </>
                                        })()}
                                    </div>
                                </td>
                            </tr>
                        } else {        //vista Buyer
                            return <tr>
                                <th>Actions</th>     
                                    <td colSpan={3}>  
                                        <div className="actions">
                                        {(() => {
                                            if (orderState === "Created" || orderState === "Shipped" || orderState === "Confirmed") {
                                                return <button
                                                    role="AskRefund"
                                                    className="cta-button basic-button blur"
                                                    type="button"
                                                    onClick={() =>  context._orderOperation(id, "AskRefund")}
                                                >Ask Refund</button>
                                            } else {
                                                return <>
                                                    <p id="none-action">You can't perform actions with this order.</p>
                                                </>
                                            }
                                        })()}
                                    </div>
                                </td>
                            </tr>
                        }
                    })()}
            </tbody>
            </table>

            <Log order={order}></Log>
        </div>
    </div>
    );
}