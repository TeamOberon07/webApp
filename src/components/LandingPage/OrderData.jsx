import { useContext, useState, useEffect } from "react";
import { StateContext } from "../StateContext";
import tokenLogo from "../../assets/usdtLogo.png";
import avaxLogo from "../../assets/avaxLogo.png";
import { Loading } from '../Loading';
import { TokenDialog } from "./TokenDialog"
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';

export function OrderData ({order, createOrder, approve, loadingText}) {
    const context = useContext(StateContext);
    
    const avaxToStable = 1;

    const steps = [
        'Approve',
        'CreateOrder',
    ];

    const AVAX = {
        "address": "NULL",
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
    const [stepActive, setStepActive] = useState(0);

    const buttonToApprove = 
        <button onClick={ () => setShowApproveSpinner(true) }  
            className="cta-button basic-button blur-light" id="createOrder">
            <div className="spinner-in-button">
                Approve 
                {showApproveSpinner && spinner}
            </div>
        </button>;

    const stepper =
        <Box sx={{ width: '100%' }}>
            <Stepper activeStep={stepActive} alternativeLabel>
                {steps.map((label) => (
                <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                </Step>
                ))}
            </Stepper>
        </Box>
    
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
                setStepActive(1);
                setApproveButton(buttonApproved);
                setOrderButton(orderButtonOK);
            }
        } catch(err) {
            setShowApproveSpinner(false);
        }
    }

    const callCreateOrder = async (selectedValue, amountIn) => {
        try {
            await createOrder(selectedValue, amountIn)
        } catch(functionCalled) {
            setClickedCreate(false);
            if (functionCalled !== avaxToStable) {
                setApproveButton(buttonApproved);
            }
            setOrderButton(orderButtonOK)
        }
    }

    useEffect(() => {
        if (context.amountApproved) {
            setShowApproveSpinner(false);
            setApproveButton(buttonApproved);
            setStepActive(1);
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

    useEffect(() => {
        if (clickedCreate) {
            callCreateOrder(selectedValue, amountIn);
        }
    }, [clickedCreate])

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
                    context._ERC20isApproved(selectedValue.address, amountIn)
                    .then((approved) => {
                        if (approved) {
                            setApproveButton(buttonApproved);
                            setStepActive(1);
                            setOrderButton(orderButtonOK);
                        } else {
                            setApproveButton(buttonToApprove);
                            setStepActive(0);
                            setOrderButton(orderButtonToApprove);
                        }
                    })
                } else {
                    setApproveButton("");
                    setOrderButton(orderButtonOK);
                }
            }
        } else {
            setApproveButton("");
            setOrderButton(orderButtonToApprove);
        }
    }, [amountIn])
    
    return (<>
        <h1 className="page-title">Payment Details</h1>
        <div className="create-tx blur">
            <p className="total-price">
                <span>
                    Payment amount in $fUSDt:
                </span>
                <span>
                    ${order.price} fUSDt<img src={tokenLogo} className="tokenLogoMin" alt="token logo"/>
                </span>
            </p>

            <div id="selectToken">
                <p>Select the token you want to pay with:</p>
                <div className="button-and-balance">
                    <p className="token-balance">Paying amount and selected token:</p>
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

            <div id="landingButtons">
                { !clickedCreate && approveButton }
                { !clickedCreate && orderButton }
                { !clickedCreate && approveButton && orderButton && stepper}
            </div>

            { !order.confirmed && loadingText !== '' && <Loading text={loadingText} />}
        </div>
    </>);
}