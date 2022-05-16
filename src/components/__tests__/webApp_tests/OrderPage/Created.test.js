import { render, screen, fireEvent } from '@testing-library/react';
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
            currentAddress:"",
            currentBalance:"",
            _connectWallet:() =>{},
            _setListenerMetamaskAccount:() =>{},
            _getOrderById: async (id) => Promise.resolve(order),
            _getQRCode:(order) => {},
            _orderOperation:(id, string, amount) => {},
            _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
            }}>
            <BrowserRouter>
                <OrderPage />
            </BrowserRouter>
        </StateContext.Provider>)
        
        // fireEvent.click(screen.getByRole('MarkAsShipped'));
        // fireEvent.click(screen.getByRole('DeleteOrder'));   

    });

    it('renders OrderPage with correct data', async () => {
        render(<StateContext.Provider value={ {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:false,
            currentAddress:"",
            currentBalance:"",
            _connectWallet:() =>{},
           _setListenerMetamaskAccount:() =>{},
           _getOrderById: async (id) => Promise.resolve(order),
           _getQRCode:(order) => {},
           _orderOperation:(id, string, amount) => {},
           _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
         }}>
           <BrowserRouter>
               <OrderPage />
           </BrowserRouter>
       </StateContext.Provider>)

        // fireEvent.click(screen.getByRole('AskRefund'));
   });
});
