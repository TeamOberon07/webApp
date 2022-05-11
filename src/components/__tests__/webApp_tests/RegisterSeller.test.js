import { render, screen, fireEvent } from "@testing-library/react"
import { RegisterSeller } from "../../RegisterSeller";
import '@testing-library/jest-dom';
import { StateContext } from '../../StateContext';
import { BrowserRouter } from "react-router-dom";

test("TUx visualizzazione pagina registrazione seller", ()=>{

    let mockTx = {
        "hash": "0xf6eb19bdc142f351d281d024fb82f30dbc3d24e719dcc44c561f16a0ac6f59fc",
        "type": 2,
        "accessList": null,
        "blockHash": null,
        "blockNumber": null,
        "transactionIndex": null,
        "confirmations": 0,
        "from": "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
        "gasPrice": {
            "type": "BigNumber",
            "hex": "0x021398dbb4"
        },
        "maxPriorityFeePerGas": {
            "type": "BigNumber",
            "hex": "0x908a9040"
        },
        "maxFeePerGas": {
            "type": "BigNumber",
            "hex": "0x021398dbb4"
        },
        "gasLimit": {
            "type": "BigNumber",
            "hex": "0x011a25"
        },
        "to": "0xF2A05049352dFAA2BdefE1357cc2beD4486E2E5e",
        "value": {
            "type": "BigNumber",
            "hex": "0x00"
        },
        "nonce": 0,
        "data": "0x128b8532",
        "r": "0x662acb94b622330f44fa5895841e6018dff8f14f80d7df16c5ab88cde5685e18",
        "s": "0x1b038923672814a7cc1490411156d47903d55791a684b91908185cda855f05e9",
        "v": 0,
        "creates": null,
        "chainId": 0
    };

    render(<StateContext.Provider value={ {
        currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482", 
        balance:"3",
        _contract: {registerAsSeller: () =>{ return mockTx}},
    _connectWallet: () =>{},
    _setListenerMetamaksAccount: () =>{}
    }} >
             <BrowserRouter>
            <RegisterSeller></RegisterSeller>
            </BrowserRouter>
        </StateContext.Provider> );
        fireEvent.click(screen.getByRole('button'));

    expect(screen.getByRole("button")).toBeEnabled;
    expect(screen.getByText("Register to our platform as a Seller"));
})
