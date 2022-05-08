import { useState } from "react";
import tokenLogo from "../../assets/usdcLogo.png";
import avaxLogo from "../../assets/avaxLogo.png";
import { Loading } from '../Loading';
import { TokenDialog } from "./TokenDialog"

export function OrderData ({order, confirmOrder, loadingText}) {
    const [clickedConfirm, setClickedConfirm] = useState(false);

    let selectedToken = "AVAX";
    let selectedTokenLogo = avaxLogo;

    const AVAX = {
        "address": "NULL",
        "name": "AVAX",
        "symbol": "AVAX",
        "logoURI": avaxLogo
    }

    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(AVAX);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = (value) => {
        setOpen(false);
        setSelectedValue(value);
    };
    
    return (<>
        <div className="create-tx">
            <p className="total-price">
                <span>
                    Payment amount:
                </span>
                <span>
                    {order.price} USDC<img src={tokenLogo} className="tokenLogoMin" alt="token logo"/>
                </span>
            </p>

            <div id="selectToken">
                <p>Select the token you want to pay:</p>
                <button onClick={handleClickOpen} className="cta-button select-button blur">
                    {selectedValue.symbol}
                    <img src={selectedValue.logoURI} className="tokenLogoMin" alt="token logo"/>
                    <span className="material-icons">expand_more</span>
                </button>
                <TokenDialog
                    selectedValue={selectedValue}
                    open={open}
                    onClose={handleClose}
                />
            </div>

            { !clickedConfirm && 
                <button onClick={ () => {
                    setClickedConfirm(true);
                    confirmOrder();
                }}
                className="cta-button basic-button create-tx-button blur" id="createOrder">
                    Create transaction
                </button>
            }

            { !order.confirmed && loadingText !== '' && 
            <Loading text={loadingText} />
            }
        </div>
    </>);
}