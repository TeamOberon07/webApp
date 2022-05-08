import { useContext, useState, useEffect } from "react";
import { StateContext } from "../StateContext";
import tokenLogo from "../../assets/usdtLogo.png";
import avaxLogo from "../../assets/avaxLogo.png";
import { Loading } from '../Loading';
import { TokenDialog } from "./TokenDialog"

export function OrderData ({order, confirmOrder, loadingText}) {
    const [clickedConfirm, setClickedConfirm] = useState(false);
    const context = useContext(StateContext);

    const AVAX = {
        "address": "NULL",
        "name": "AVAX",
        "symbol": "AVAX",
        "logoURI": avaxLogo,
        "balance": parseFloat(context.balance).toFixed(4)
    }

    const buttonOK = 
        <button onClick={ () => {
            setClickedConfirm(true);
            confirmOrder();
        }}
        className="cta-button basic-button blur-light" id="createOrder">
            Create transaction
        </button>;

    const buttonNOK =
        <button className="cta-button basic-button insufficient-balance-button" id="createOrder">
            Insufficient Balance  
        </button>
    
    
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(AVAX);
    const [amountIn, setAmountIn] = useState();
    const [displayedAmountIn, setDisplayedAmountIn] = useState("---");
    const [tokenBalance, setTokenBalance] = useState(AVAX.balance);
    const [button, setButton] = useState(buttonOK);
    
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };

    useEffect(() => {
        context._getAmountsIn(selectedValue, order.price).then((maxAmountIn) => {
            setAmountIn(maxAmountIn);
            let displayed = maxAmountIn/10**18;
            displayed = displayed.toFixed(4);
            displayed = parseFloat(displayed);
            setDisplayedAmountIn(displayed);
            setTokenBalance(selectedValue.balance);
            if (displayed > selectedValue.balance) {
                setButton(buttonNOK);
            } else {
                setButton(buttonOK);
            }
        })
    }, [selectedValue])
    
    return (<>
        <div className="container">
            <h1 class="page-title">Order Details</h1>
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

                { !clickedConfirm && button }

                { !order.confirmed && loadingText !== '' && 
                <Loading text={loadingText} />
                }
            </div>
        </div>
    </>);
}