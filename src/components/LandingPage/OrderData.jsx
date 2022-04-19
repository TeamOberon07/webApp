import { useState } from "react";
import avaxLogo from "../../assets/avaxLogoMin.png";
import { Loading } from '../Loading';

export function OrderData ({order, confirmOrder, loadingText}) {
    const [clickedConfirm, setClickedConfirm] = useState(false);
    
    return (<>

        <p className="total-price">Payment amount: &nbsp; {order.price} AVAX<img src={avaxLogo} className="avaxLogoMin" alt="avax logo"/></p>

        { !clickedConfirm && 
            <button onClick={ () => {
                setClickedConfirm(true);
                confirmOrder();
            }}
            className="cta-button basic-button create-transaction" id="createOrder">Create transaction
            </button>
        }

        { !order.confirmed && loadingText !== '' && 
        <Loading text={loadingText} />
        }
    </>);
}