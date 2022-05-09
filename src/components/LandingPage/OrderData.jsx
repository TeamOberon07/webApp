import { useContext, useState, useEffect } from "react";
import { StateContext } from "../StateContext";
import tokenLogo from "../../assets/usdtLogo.png";
import avaxLogo from "../../assets/avaxLogo.png";
import { Loading } from '../Loading';
import { TokenDialog } from "./TokenDialog"

export function OrderData ({order, createOrder, approve, loadingText}) {
    const context = useContext(StateContext);
    
    const AVAX = {
        "address": "",
        "name": "AVAX",
        "symbol": "AVAX",
        "logoURI": avaxLogo,
        "balance": parseFloat(context.balance).toFixed(4)
    }

    const spinner = <div className="spinner"><div className="half-spinner"></div></div>;

    const buttonApproved =
        <button className="cta-button basic-button disabled-button approved-button" id="createOrder">
            Approved
        </button>;
    
    const orderButtonOK = 
        <button onClick={ () => {
                setClickedCreate(true);
                createOrder(selectedValue, amountIn);
            }}  className="cta-button basic-button blur-light" id="createOrder">
            Create transaction
        </button>;

    const orderButtonToApprove =
        <button className="cta-button basic-button disabled-button" id="createOrder">
            Create transaction
        </button>

    const orderButtonNOK =
        <button className="cta-button basic-button disabled-button" id="createOrder">
            Insufficient Balance  
        </button>
    
    const [open, setOpen] = useState(false);
    const [clickedCreate, setClickedCreate] = useState(false);
    const [selectedValue, setSelectedValue] = useState(AVAX);
    const [amountIn, setAmountIn] = useState(0);
    const [displayedAmountIn, setDisplayedAmountIn] = useState("---");
    const [tokenBalance, setTokenBalance] = useState(AVAX.balance);
    const [orderButton, setOrderButton] = useState(orderButtonToApprove);
    const [approveButton, setApproveButton] = useState("");
    const [showApproveSpinner, setShowApproveSpinner] = useState(false);

    const buttonToApprove = 
        <button onClick={ () => {
                setShowApproveSpinner(true);
                //callApprove()
            }}  
            className="cta-button basic-button blur-light" id="createOrder">
            <div className="spinner-in-button">
                Approve 
                {showApproveSpinner && spinner}
            </div>
        </button>;
    
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };

    const callApprove = async () => {
        try {
            let approved = await approve(selectedValue, amountIn)
            if (approved) {
                setShowApproveSpinner(false);
                setApproveButton(buttonApproved);
                setOrderButton(orderButtonOK);
            }
        } catch(err) {
            setShowApproveSpinner(false);
        }
    }

    useEffect(() => {
        if (context.amountApproved) {
            setShowApproveSpinner(false);
            setApproveButton(buttonApproved);
            setOrderButton(orderButtonOK);
        }
    }, [context.amountApproved])

    useEffect(() => {
        setApproveButton("");
        setOrderButton(orderButtonToApprove);
        context._getAmountsIn(
            selectedValue, 
            order.price
        ).then((maxAmountIn) => {
            setAmountIn(maxAmountIn)
        });
    }, [selectedValue])

    useEffect(() => {
        setApproveButton(buttonToApprove);
        if (showApproveSpinner) {
            callApprove()
        }
    }, [showApproveSpinner])

    useEffect(() => {
        let displayed = amountIn/10**18;
        displayed = displayed.toFixed(4);
        displayed = parseFloat(displayed);
        setDisplayedAmountIn(displayed);
        setTokenBalance(selectedValue.balance);
        if (displayed) {
            if (displayed > selectedValue.balance) {
                setApproveButton("");
                setOrderButton(orderButtonNOK);
            } else {
                if (selectedValue.name !== "AVAX") {
                    context._ERC20isApproved(selectedValue.address, amountIn).then((approved) => {
                        if (approved) {
                            setApproveButton(buttonApproved);
                            setOrderButton(orderButtonOK);
                        } else {
                            setApproveButton(buttonToApprove);
                            setOrderButton(orderButtonToApprove);
                        }
                    })
                } else {
                    setApproveButton("");
                    setOrderButton(orderButtonOK);
                }
            }
        }
    }, [amountIn])
    
    return (<>
        <div className="container">
            <h1 className="page-title">Order Details</h1>
            <div className="create-tx blur">
                <p className="total-price">
                    <span>
                        Payment amount:
                    </span>
                    <span>
                        ${order.price} fUSDt<img src={tokenLogo} className="tokenLogoMin" alt="token logo"/>
                    </span>
                </p>

                <div id="selectToken">
                    <p>Select the token you want to pay with:</p>
                    <div className="button-and-balance">
                        <p className="token-balance">Amount and selected token:</p>
                        <button onClick={handleClickOpen} className="cta-button select-button blur-light">
                            {displayedAmountIn} &nbsp;
                            {selectedValue.symbol}
                            <img src={selectedValue.logoURI} className="tokenLogoMin" alt="token logo"/>
                            <span className="material-icons">expand_more</span>
                        </button>
                        <p className="token-balance">Balance: {tokenBalance}</p>
                    </div>
                    <TokenDialog
                        selectedValue={selectedValue}
                        open={open}
                        onClose={handleClose}
                    />
                </div>

                { !clickedCreate && approveButton }
                { !clickedCreate && orderButton }

                { !order.confirmed && loadingText !== '' && <Loading text={loadingText} />}
            </div>
        </div>
    </>);
}