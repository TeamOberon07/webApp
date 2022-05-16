import { render, screen, fireEvent, findByTestId } from '@testing-library/react';
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
            id: "15"
        }
    })
}));

describe('OrderPage', () => {
    const order = [
        {
            "type": "BigNumber",
            "hex": "0x0f"
        },
        "0x90FC8a77E3a62A20f73CAcAaA04c3A2c22452B62",
        "0x25EfE244b43036aF8915Aa9806a478f9405D31db",
        {
            "type": "BigNumber",
            "hex": "0x0dbd2fc137a30000"
        },
        0
    ];

    it('renders OrderPage with correct data', async () => {
        
        render(<StateContext.Provider value={ {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:true,
            orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
            currentAddress:"",
            currentBalance:"",
            _contract:{
                STABLECOIN:() => jest.fn()
            },

            _getERC20Balance:(stableAddress) =>{},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
            _connectWallet:() =>{},
            _setListenerMetamaskAccount:() =>{},
            _getOrderById: async (id) => Promise.resolve([
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                0
            ]),
            _getQRCode:(order) => {},
            _orderOperation:(id, string, amount) => {},
            _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
            }}>
            <BrowserRouter>
                <OrderPage />
            </BrowserRouter>
        </StateContext.Provider>)
          fireEvent.click(await screen.findByText('Mark as Shipped'));
          fireEvent.click(await screen.findByText('Delete Order'));
    });

    it('renders OrderPage with correct data', async () => {
        render(<StateContext.Provider value={ {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:false,
            orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
            currentAddress:"",
            currentBalance:"",
            _contract:{
                STABLECOIN:() => jest.fn()
            },

            _getERC20Balance:(stableAddress) =>{},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
            _connectWallet:() =>{},
            _setListenerMetamaskAccount:() =>{},
            _getOrderById: async (id) => Promise.resolve( [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ]),
            _getQRCode:(order) => {},
            _orderOperation:(id, string, amount) => {},
            _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
         }}>
           <BrowserRouter>
               <OrderPage />
           </BrowserRouter>
       </StateContext.Provider>)

       
    });
});
