import { useState } from "react";
import tokenLogo from "../../assets/usdcLogoMin.png";
import { Loading } from '../Loading';

export function OrderData ({order, confirmOrder, loadingText}) {
    const [clickedConfirm, setClickedConfirm] = useState(false);
    
    return (<>
        <div class="create-tx">
            <p className="total-price">Payment amount: &nbsp; {order.price} USDC<img src={tokenLogo} className="tokenLogoMin" alt="token logo"/></p>

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