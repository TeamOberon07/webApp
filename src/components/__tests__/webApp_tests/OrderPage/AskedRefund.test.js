import { render, fireEvent, screen } from '@testing-library/react';
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

        global.window.ethereum = {chainId: "0x4"};
        
         render(<StateContext.Provider value={ {
            ourNetwork: "rinkeby",
            rightChain: "true",
            networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},
             userIsSeller:true,
             orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
             orderOperations:[],
             currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482", 
            currentBalance:"",
            _contract:{
                STABLECOIN:() => jest.fn()
            },
            _cutAddress:() => { return "0xe5B1...797482"},
            _getERC20Balance:(stableAddress) => {},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
             _connectWallet:() => {},
            _setListenerMetamaskAccount:() => {},
            _setListenerNetworkChanged:() => {},
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
        fireEvent.click(await screen.findByRole('button',{name:"Refund Buyer"}));
    });

    it('renders OrderPage with correct data', async () => {

        global.window.ethereum = {chainId: "0x4"};
        
         render(<StateContext.Provider value={ {
            ourNetwork: "rinkeby",
            rightChain: "true",
            networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},
             userIsSeller:false,
             orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
             orderOperations:[],
             currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482", 
            currentBalance:"",
            _contract:{
                STABLECOIN:() => jest.fn()
            },
            _cutAddress:() => { return "0xe5B1...797482"},
            _getERC20Balance:(stableAddress) => {},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
             _connectWallet:() => {},
            _setListenerMetamaskAccount:() => {},
            _setListenerNetworkChanged:() => {},
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
    });
});