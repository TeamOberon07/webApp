import React, { useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { Header } from "./Header";
import { StateContext } from "./StateContext";
import { Log } from "./Log";
import { Loading } from "./Loading";
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { SwitchNetwork } from "./SwitchNetwork";
import tokenLogo from "../assets/usdtLogo.png";

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

//pagina nella quale è possibile vedere i dettagli dell'ordine selezionato dalla homepage 
//ed effettuare alcune azioni che ne cambiano lo stato
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
    const [stepActive, setStepActive] = useState(0);
    const [refundClicked, setRefundClicked] = useState(false);

    const steps = ['Approve', 'Refund',];

    const stepper =
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={stepActive} alternativeLabel>
                {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
                ))}
            </Stepper>
        </Box>;

    useEffect(async () => {
        await context._connectWallet();
        context._setListenerMetamaskAccount();
        context._setListenerNetworkChanged();

        //richiesta allo smart contract dell'ordine conoscendone l'id
        let order = await context._getOrderById(id);
        setOrder(order);
        setAmount(order[3]);
    }, []);

    useEffect(() => {
        if (context.userIsSeller && order){
            //l'utente è il seller dell'ordine e perciò può visualizzarne il QR Code
            context._getQRCode(order);
        }
    }, [context.userIsSeller, order]);

    useEffect(() => {
        if (context.orderStateChanged){
            //nel caso di transazione appena completata su questa pagina, lo stato è cambiato
            //quindi la finestra viene aggiornata per riflettere il cambiamento sui dati
            setTxWaiting(txWaitingInit);
            context._setOrderStateChangedFalse();
            window.location.reload();
        }
    }, [context.orderStateChanged]);

    const spinner = <div className="spinner"><div className="half-spinner"></div></div>;

    const buttonToApprove = 
        <button onClick={ () => setShowApproveSpinner(true) }  
            className="cta-button basic-button blur-light" id="approve-button">
            <div className="spinner-in-button">
                Approve {showApproveSpinner && spinner}
            </div>
        </button>;

    const buttonApproved =
        <button className="cta-button basic-button disabled-button approved-button" id="approve-button">
            Approved
        </button>;
    
    const refundButtonOK = 
        <button role={operations[2]} className="cta-button basic-button blur-light" type="button"
            onClick={() => { setTxWaiting({ [operations[2]]: true }); setRefundClicked(true); }}>
            <div className="spinner-in-button">Refund Buyer {txWaiting[operations[2]] && spinner}</div>
        </button>

    const refundButtonToApprove =
        <button role={operations[2]} className="cta-button basic-button disabled-button" id="refund-button">
            Refund Buyer
        </button>

    const refundButtonNOK =
        <button role={operations[2]} className="cta-button basic-button disabled-button" id="refund-button">
            Insufficient Balance  
        </button>

    const [approveButton, setApproveButton] = useState("");
    const [refundButton, setRefundButton] = useState(refundButtonToApprove);

    useEffect(async () => {
        if (refundClicked) {
            //viene iniziata un'operazione di RefundBuyer sull'ordine
            await callOrderOperation(operations[2], amount)
        }
    }, [refundClicked])
    
    //funzione che chiama _orderOperation() dello stateContext permettendole di creare la transazione che cambierà lo stato dell'ordine
    async function callOrderOperation(type, _amount) {
        try {
            await context._orderOperation(id, type, _amount);
        } catch(err) {
            setTxWaiting({ [type]: false });
        }
        setRefundClicked(false)
    }

    useEffect(async () => {
        if(txWaiting[operations[2]])
            setRefundButton(refundButtonOK);
    }, [txWaiting[operations[2]]])

    const callApprove = async () => {
        try {
            let approved = await context._approveERC20(context.stablecoinAddress, amount)
            if (approved) {
                setShowApproveSpinner(false);
                setApproveButton(buttonApproved);
                setStepActive(1);
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
            setStepActive(1);
            setRefundButton(refundButtonOK);
        }
    }, [context.amountApproved])

    useEffect(() => {
        if (showApproveSpinner) {
            setApproveButton(buttonToApprove);
            setStepActive(0);
            callApprove()
        }
        if (!context.amountApproved) {
            setApproveButton(buttonToApprove);
            setStepActive(0);
        }
    }, [showApproveSpinner])

    useEffect(async () => {
        if (context.userIsSeller){
            if (amount) {
                let stableBalance = await context._getERC20Balance(context.stablecoinAddress);
                let amountDecimal = amount/10**18
                if (amountDecimal > stableBalance) {
                    setApproveButton("");
                    setRefundButton(refundButtonNOK);
                } else {
                    context._ERC20isApproved(context.stablecoinAddress, amount)
                    .then((approved) => {
                        if (approved) {
                            setApproveButton(buttonApproved);
                            setStepActive(1);
                            setRefundButton(refundButtonOK);
                        } else {
                            setApproveButton(buttonToApprove);
                            setStepActive(0);
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

    if (window.ethereum === undefined) { return <NoWalletDetected/>; }
    
    if (!context.currentAddress) {
        return <ConnectWallet connectWallet={async () => await context._connectWallet()}/>;
    }

    if (window.ethereum.chainId !== context.networks[context.ourNetwork].chainId || !context.rightChain) {
        return <SwitchNetwork switchNetwork={async () => await context._changeNetwork(context.ourNetwork)}/>;
    }

    if (order) {
        orderState = context.orderState[order[4]];
        let buyerAddress = order[1].toLowerCase();
        let sellerAddress = order[2].toLowerCase();
        let currentAddress = context.currentAddress.toLowerCase();

        if (buyerAddress && sellerAddress && currentAddress) {
            if (currentAddress != buyerAddress && currentAddress != sellerAddress) {
                //l'utente del wallet non è né Seller né buyer dell'ordine e quindi viene riportato alla homepage
                window.location.href = '/';
            }
        }

        return (<div className="orderPage">
            <Header/>
            <div className="container">
                <h1 className="page-title">Order page</h1>
                <table id="order-page-container" className="blur">
                <tbody>
                    {(() => {
                        //in base al ruolo dell'utente nell'ordine viene mostrata quella dell'altro
                        if (context.userIsSeller)
                            return <tr><th id="orderPageAddress">Buyer Address</th><td colSpan={2} className="address">{buyerAddress}</td></tr>
                        else
                            return <tr><th id="orderPageAddress">Seller Address</th><td className="address">{sellerAddress}</td></tr>
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
                            if (context.userIsSeller) {     
                                //vista Seller (le azioni possibili sono diverse da quelle del Buyer)
                                return <tr>
                                    <th>Actions</th>     
                                    <td colSpan={3}>  
                                        <div className="actions">
                                            {(() => {
                                                if (orderState === "Created" || orderState === "Shipped"){
                                                    //l'ordine può essere annullato prevedendo un rimborso del Buyer
                                                    return <button role={operations[0]}
                                                        className="cta-button basic-button blur-light"
                                                        type="button"
                                                        onClick={() => { setTxWaiting({ [operations[0]]: true }); callOrderOperation(operations[0]) }}
                                                        ><div className="spinner-in-button">Delete Order {txWaiting[operations[0]] && spinner}</div></button>
                                                }
                                            })()}

                                            {(() => {
                                                if (orderState === "Created"){
                                                    //il Seller può far passare allo stato "Shipped" un ordine "Created"
                                                    return <button role={operations[1]}
                                                        className="cta-button basic-button blur-light"
                                                        type="button"
                                                        onClick={() => { setTxWaiting({ [operations[1]]: true }); callOrderOperation(operations[1]) }}
                                                    ><div className="spinner-in-button">Mark as Shipped {txWaiting[operations[1]] && spinner}</div></button>
                                                }
                                            })()}
                                            
                                            {(() => {
                                                if (orderState === "Asked Refund") {
                                                    //se il Buyer ha richiesto il reso, in questa pagina è possibile fornirlo
                                                    return <>
                                                        { approveButton }
                                                        { refundButton }
                                                        { approveButton && refundButton && stepper }
                                                    </>
                                                }
                                            })()}

                                            {(() => {
                                                if (orderState !== "Created" && orderState !== "Shipped" && orderState !== "Asked Refund")
                                                    return <>
                                                        <p id="none-action">You can't perform actions with this order.</p>
                                                    </>
                                            })()}
                                        </div>
                                    </td>
                                </tr>
                            } else {        
                                //vista Buyer
                                return <tr>
                                    <th>Actions</th>     
                                        <td colSpan={3}>  
                                            <div className="actions">
                                            {(() => {
                                                if (orderState === "Created" || orderState === "Confirmed") {
                                                    //in alcuni stati il Buyer può richiedere il rimborso
                                                    return <button role={operations[3]} className="cta-button basic-button blur-light"
                                                        type="button"
                                                        onClick={() => { setTxWaiting({ [operations[3]]: true }); callOrderOperation(operations[3]) }}
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
                {/*sezione dedicata ai log dell'ordine in visualizzazione*/}
                <Log order={order}></Log>
            </div>
        </div>
        );
    } else
        return <Loading/>;
}