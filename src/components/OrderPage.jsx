import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { Header } from "./Header";
import { StateContext } from "./StateContext";
import { Log } from "./Log";
import { Loading } from "./Loading";
import tokenLogo from "../assets/usdtLogo.png";

export function OrderPage() {
    const context = useContext(StateContext);

    const id = useLocation().state.id;
    var orderState;
    const operations = context.orderOperations;
    var txWaitingInit = {
        [operations[0]]: false,
        [operations[1]]: false,
        [operations[2]]: false,
        [operations[3]]: false
    }
    const [txWaiting, setTxWaiting] = useState(txWaitingInit);
    const [order, setOrder] = useState();
    const [amount, setAmount] = useState(0);
    const [showApproveSpinner, setShowApproveSpinner] = useState(false);
    const [stableAddress, setStableAddress] = useState("");

    useEffect(async () => {
        await context._connectWallet();
        context._setListenerMetamaskAccount();
        let order = await context._getOrderById(id);
        setOrder(order);
        setAmount(order[3]);
    }, []);

    useEffect(() => {
        if (context.userIsSeller && order){
            context._getQRCode(order);
        }
    }, [context.userIsSeller, order]);

    useEffect(() => {
        if (context.orderStateChanged){
            setTxWaiting(txWaitingInit);
            context._setOrderStateChangedFalse();
            window.location.reload();
        }
    }, [context.orderStateChanged]);

    const spinner = <div className="spinner"><div className="half-spinner"></div></div>;

    const buttonToApprove = 
        <button onClick={ () => setShowApproveSpinner(true) }  
            className="cta-button basic-button blur-light" id="createOrder">
            <div className="spinner-in-button">
                Approve 
                {showApproveSpinner && spinner}
            </div>
        </button>;

    const buttonApproved =
        <button className="cta-button basic-button disabled-button approved-button" id="createOrder">
            Approved
        </button>;
    
    const refundButtonOK = 
        <button
        role={operations[2]}
        className="cta-button basic-button blur"
        type="button"
        onClick={() => { callOrderOperation(operations[2], amount) }}
        ><div className="spinner-in-button">Refund Buyer {txWaiting[operations[2]] && spinner}</div></button>

    const refundButtonToApprove =
        <button className="cta-button basic-button disabled-button" id="createOrder">
            Refund Buyer
        </button>

    const refundButtonNOK =
        <button className="cta-button basic-button disabled-button" id="createOrder">
            Insufficient Balance  
        </button>

    const [approveButton, setApproveButton] = useState("");
    const [refundButton, setRefundButton] = useState(refundButtonToApprove);

    async function callOrderOperation(type, amount) {
        setTxWaiting({ [type]: true });
        try {
            await context._orderOperation(id, type, amount);
        } catch(err) {
            setTxWaiting({ [type]: false });
        }
    }

    const callApprove = async () => {
        try {
            let approved = await context._approveERC20(stableAddress, amount)
            if (approved) {
                setShowApproveSpinner(false);
                setApproveButton(buttonApproved);
                setRefundButton(refundButtonOK);
            }
        } catch(err) {
            setShowApproveSpinner(false);
        }
    }

    useEffect(() => {
        if (context.amountApproved) {
            setShowApproveSpinner(false);
            setApproveButton(buttonApproved);
            setRefundButton(refundButtonOK);
        }
    }, [context.amountApproved])

    useEffect(() => {
        if (showApproveSpinner) {
            setApproveButton(buttonToApprove);
            callApprove()
        }
        if (!context.amountApproved) {
            setApproveButton(buttonToApprove);
        }
    }, [showApproveSpinner])

    useEffect(async () => {
        if (context.userIsSeller){
            if (amount) {
                let stableAddress = await context._contract.STABLECOIN();
                setStableAddress(stableAddress);
                let stableBalance = await context._getERC20Balance(stableAddress);
                let amountDecimal = amount/10**18
                if (amountDecimal > stableBalance) {
                    setApproveButton("");
                    setRefundButton(refundButtonNOK);
                } else {
                    context._ERC20isApproved(stableAddress, amount)
                    .then((approved) => {
                        if (approved) {
                            setApproveButton(buttonApproved);
                            setRefundButton(refundButtonOK);
                        } else {
                            setApproveButton(buttonToApprove);
                            setRefundButton(refundButtonToApprove);
                        }
                    })
                }
            } else {
                setApproveButton("");
                setRefundButton(refundButtonToApprove);
            }
        }
    }, [amount])

    if (order) {
        orderState = context.orderState[order[4]];
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
                                        <div id="qrcode-container">
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
                                                        role={operations[0]}
                                                        className="cta-button basic-button blur"
                                                        type="button"
                                                        onClick={() => { callOrderOperation(operations[0]) }}
                                                        ><div className="spinner-in-button">Delete Order {txWaiting[operations[0]] && spinner}</div></button>
                                            })()}

                                            {(() => {
                                                if (orderState === "Created")
                                                    return <button
                                                        role={operations[1]}
                                                        className="cta-button basic-button blur"
                                                        type="button"
                                                        onClick={() => { callOrderOperation(operations[1]) }}
                                                    ><div className="spinner-in-button">Mark as Shipped {txWaiting[operations[1]] && spinner}</div></button>
                                            })()}
                                            
                                            {(() => {
                                                if (orderState === "Asked Refund") {
                                                    return <>
                                                        { approveButton }
                                                        { refundButton }
                                                    </>
                                                }
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
                                                        role={operations[3]}
                                                        className="cta-button basic-button blur"
                                                        type="button"
                                                        onClick={() => { callOrderOperation(operations[3]) }}
                                                    ><div className="spinner-in-button">Ask Refund {txWaiting[operations[3]] && spinner}</div></button>
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
    else
        return <Loading/>;
}