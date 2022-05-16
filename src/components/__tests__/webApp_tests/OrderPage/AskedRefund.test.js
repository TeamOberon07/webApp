import { render, fireEvent, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrderPage } from '../../../OrderPage';
import { BrowserRouter} from "react-router-dom";
import { StateContext} from '../../../StateContext';
import React from 'react';

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useLocation: () => ({
        pathname: "localhost:3000/order-page",
        state: {
            "order":[
                {
                    "_hex": "0x01",
                    "_isBigNumber": true
                },
                "0x90FC8a77E3a62A20f73CAcAaA04c3A2c22452B62",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                {
                    "_hex": "0x01",
                    "_isBigNumber": true
                }
            ],
        }
    })
}));

describe('OrderPage', () => {
    it('renders OrderPage with correct data', async () => {
         render(<StateContext.Provider value={ {
             userIsSeller:true,
             orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
             orderOperations:[],
            currentAddress:"",
            currentBalance:"",
            _contract:{
                STABLECOIN:() => jest.fn()
            },
            _getERC20Balance:(stableAddress) =>{},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
             _connectWallet:() =>{},
            _setListenerMetamaskAccount:() =>{},
            _getOrderById:(id) =>Promise.resolve(
                [
                    {
                        "type": "BigNumber",
                        "hex": "0x1a"
                    },
                    "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                    "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                    "300000000000000",
                    4
                ]
            ),
            _getQRCode:(order) => {},
            _orderOperation:(id, string, amount) => {},
            _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
          }}>
            <BrowserRouter>
                <OrderPage />
            </BrowserRouter>
        </StateContext.Provider>)

        fireEvent.click(await screen.findByRole('button',{name:"Approve"}));
        // await waitFor(()=>{expect(screen.findByRole('button',{name:"Refund Buyer"}).not.toHaveClass('disabled-button'))});
        fireEvent.click(await screen.findByRole('button',{name:"Refund Buyer"}));
    });
});
