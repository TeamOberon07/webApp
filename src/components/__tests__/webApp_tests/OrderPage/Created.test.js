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

    test('TU14 renders OrderPage with correct data for Seller', async () => {
        
        global.window.ethereum = {chainId: "0x4"};

        render(<StateContext.Provider value = { {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:true,
            orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
            currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482", 
            currentBalance:"",
            ourNetwork: "rinkeby",
            rightChain: "true",
            networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},
            _contract:{
                STABLECOIN:() => jest.fn()
            },

            _cutAddress:() => { return "0xe5B1...797482"},
            _getERC20Balance:(stableAddress) => {},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
            _connectWallet:() => {},
            _setListenerMetamaskAccount:() => {},
            _setListenerNetworkChanged:() => {},
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

    test('TU15 renders OrderPage with correct data for Buyer', async () => {
        
        global.window.ethereum = {chainId: "0x4"};

        render(<StateContext.Provider value={ {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:false,
            orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
            currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482", 
            currentBalance:"",
            ourNetwork: "rinkeby",
            rightChain: "true",
            networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},
            _contract:{
                STABLECOIN:() => jest.fn()
            },

            _cutAddress:() => { return "0xe5B1...797482"},
            _getERC20Balance:(stableAddress) => {},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
            _connectWallet:() => {},
            _setListenerMetamaskAccount:() => {},
            _setListenerNetworkChanged:() => {},
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
        expect(screen.queryByText('Mark as Shipped')).toBeNull();
        expect(screen.queryByText('Delete Order')).toBeNull();
    });

    test('TU16 renders OrderPage No Metamask', async () => {
        
        delete window.ethereum;

        render(<StateContext.Provider value={ {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:false,
            orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
            currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482", 
            currentBalance:"",
            ourNetwork: "rinkeby",
            rightChain: "true",
            networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},
            _contract:{
                STABLECOIN:() => jest.fn()
            },

            _cutAddress:() => { return "0xe5B1...797482"},
            _getERC20Balance:(stableAddress) => {},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
            _connectWallet:() => {},
            _setListenerMetamaskAccount:() => {},
            _setListenerNetworkChanged:() => {},
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
        expect(screen.getByText(/No Ethereum wallet was detected/i)).toBeInTheDocument();

        window.ethereum = true;
    });

    test('TU17 renders OrderPage No Wallet', async () => {
        
        global.window.ethereum = "";

        render(<StateContext.Provider value = { {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:false,
            orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
            currentAddress:"", 
            currentBalance:"",
            ourNetwork: "rinkeby",
            rightChain: "true",
            networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},
            _contract:{
                STABLECOIN:() => jest.fn()
            },

            _cutAddress:() => { return "0xe5B1...797482"},
            _getERC20Balance:(stableAddress) => {},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
            _connectWallet:() => {},
            _setListenerMetamaskAccount:() => {},
            _setListenerNetworkChanged:() => {},
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
        expect(screen.getByText("Connect Wallet")).toBeInTheDocument();;
    });


    test('TU18 renders OrderPage Switch Network', async () => {
        
        global.window.ethereum = {chainId:"0x2"};

        render(<StateContext.Provider value={ {
            orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
            userIsSeller:false,
            orderState:["Created","Shipped","Confirmed","Deleted","Asked Refund","Refunded"],
            currentAddress:"0xe5B197D91ad002a18917aB4fdc6b6E0126797482", 
            currentBalance:"",
            ourNetwork: "rinkeby",
            rightChain: "true",
            networks:{"rinkeby":{"chainId":"0x4","chainName":"Ethereum Rinkeby Testnet","nativeCurrency":{"name":"AVAX","symbol":"AVAX","decimals":18},"rpcUrls":["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],"blockExplorerUrls":["https://rinkeby.etherscan.io"]}},
            _contract:{
                STABLECOIN:() => jest.fn()
            },

            _cutAddress:() => { return "0xe5B1...797482"},
            _getERC20Balance:(stableAddress) =>{},
            _ERC20isApproved:(stableAddress,amount) => Promise.resolve(),
            _connectWallet:() => {},
            _setListenerMetamaskAccount:() => {},
            _setListenerNetworkChanged:() => {},
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
        expect(screen.getByText("Switch Network")).toBeInTheDocument();;
    });
});