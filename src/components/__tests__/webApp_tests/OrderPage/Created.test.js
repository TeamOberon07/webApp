import { render,screen, fireEvent} from '@testing-library/react';
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

            "orderState": "Created"
        }
    })
}));

describe('OrderPage', () => {
    it('renders OrderPage with correct data', async () => {
         render(<StateContext.Provider value={ {
             userIsSeller:true,
             currentAddress:"",
             currentBalance:"",
             _connectWallet:() =>{},
            _setListenerMetamaksAccount:() =>{},
            _getQRCode:(order) => {},
            _orderOperation:(id, string, amount) => {},
            _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
          }}>
            <BrowserRouter>
                <OrderPage />
            </BrowserRouter>
        </StateContext.Provider>)

        fireEvent.click(screen.getByRole('MarkAsShipped'));
        fireEvent.click(screen.getByRole('DeleteOrder'));
    });

    it('renders OrderPage with correct data', async () => {
        render(<StateContext.Provider value={ {
            userIsSeller:false,
            currentAddress:"",
            currentBalance:"",
            _connectWallet:() =>{},
           _setListenerMetamaksAccount:() =>{},
           _getQRCode:(order) => {},
           _orderOperation:(id, string, amount) => {},
           _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
         }}>
           <BrowserRouter>
               <OrderPage />
           </BrowserRouter>
       </StateContext.Provider>)

        fireEvent.click(screen.getByRole('AskRefund'));
   });
});
