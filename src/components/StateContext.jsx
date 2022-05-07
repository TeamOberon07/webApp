import React, { createContext } from "react";
import { Contract, ethers } from "ethers";
import Escrow from "../contracts/SCEscrow.json";

export const StateContext = createContext();

export class StateProvider extends React.Component {

    initialState = {
        currentAddress: undefined,
        balance: undefined,
        contractAddress: "0xF2A05049352dFAA2BdefE1357cc2beD4486E2E5e",
        ourNetwork: "rinkeby",
        rightChain: true,
        _contract: undefined,
        _provider: undefined,
        userIsSeller: false,
        orderState: ['Created', 'Shipped', 'Confirmed', 'Deleted', 'Asked Refund', 'Refunded'],
        networks: {
            "rinkeby": {
                chainId: "0x4",
                chainName: "Ethereum Rinkeby Testnet",
                nativeCurrency: {
                    name: "AVAX",
                    symbol: "AVAX",
                    decimals: 18
                },
                rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                blockExplorerUrls: ["https://rinkey.etherscan.io"]
            }
        },

        _connectWallet: async () => {
            const [currentAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            this.setState({
                _provider: provider,
            })

            if (this.state._provider.getSigner(0)) {
                this.state._contract = new ethers.Contract(
                    this.state.contractAddress,
                    Escrow.abi,
                    this.state._provider.getSigner(0)
                );
            }

            this.setState({
                currentAddress: currentAddress,
            });
            this.setState({
                rightChain: window.ethereum.chainId === this.state.networks[this.state.ourNetwork].chainId,
            })
            this.state._updateBalance();
            this.state._userIsSeller();
        },

        // _initialize: (userAddress) => {
        //     this.state._initializeEthers();
        //     this.setState({
        //         currentAddress: userAddress,
        //     });
        //     this.state._updateBalance();
        // },

        // _initializeEthers: async () => {
        //     this.state._provider = new ethers.providers.Web3Provider(window.ethereum);

        //     if (this.state._provider.getSigner(0)) {
        //         this.state._contract = new ethers.Contract(
        //             this.state.contractAddress,
        //             Escrow.abi,
        //             this.state._provider.getSigner(0)
        //         );
        //     }
        // },

        // _setAddress: async () => {
        //     const [currentAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        //     this.state._initialize(currentAddress);
        // },
    
        _changeNetwork: async (networkName) => {
            try {
                if (!window.ethereum) throw new Error("No crypto wallet found");
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            ...this.state.networks[networkName]
                        }
                    ]
                });
                await this.state._connectWallet();
            } catch (error) {
                return error;
                //console.log(err.message);
            }
            return undefined;
        },

        _wrongChain: () => {
            this.setState({
                rightChain: false,
            })
        },

        _rightChain: () => {
            this.setState({
                rightChain: true,
            })
        },
    
        _setListenerMetamaksAccount: () => {
            window.ethereum.on('accountsChanged', () => {
                this._initialize();
            })
        },
    
        _setListenerNetworkChanged: () => {
            window.ethereum.on('chainChanged', () => {
                if (window.ethereum.chainId === this.state.networks[this.context.ourNetwork].chainId)
                    this._rightChain();
                else
                    this._wrongChain();
            });
        },
    
        // _connectWallet: async () => {
        //     // window.ethereum.on('chainChanged', async (chainId) => {
        //     //     if (chainId !== this.state.networks[this.state.ourNetwork].chainId) {
        //     //         await this.state._changeNetwork(this.state.ourNetwork);
        //     //     } else {
        //     //         await this.state._setAddress();
        //     //     }
        //     // });
        //     // if (window.ethereum.chainId !== this.state.ourNetwork) {
        //     //     await this.state._changeNetwork(this.state.ourNetwork);
        //     // } else {
        //     //     window.ethereum.on('accountsChanged', function (accounts) {
        //     //         this.state._getAccount();
        //     //     })
        //     // }
        //     await this.state._setAddress();
        // },
    
        _updateBalance: async () => {
            const balanceInWei = await this.state._provider.getBalance(this.state.currentAddress, "latest");
            const balanceInAvax = ethers.utils.formatEther(balanceInWei);
            const balance = balanceInAvax.toString()+" AVAX";
            this.setState({ balance });
        },

        _isHisOrder: async (id) => {
            const orders = await this.state._contract.getOrdersOfUser(this.state.currentAddress);
            orders.forEach(order => {console.log(order[0].toString());/*if(order[0]==id){ return true;}*/});
            return false;
        },

        getOrderById: async (id) => {
            const orders = await this.state._contract.getOrdersOfUser(this.state.currentAddress);
            for (var i=0; i<orders.length; i++) {
                if (id === orders[i][0].toString())
                    return orders[i];
            }
        },

        _orderOperation: async (id, expr, orderAmount) => {
            try {
                var tx, error = undefined;
                switch(expr) {
                    case "Confirm":
                        tx = await this.state._contract.confirmOrder(id);
                        break;
                    case "SetAsShipped":
                            tx = await this.state._contract.shipOrder(id);
                    case "Delete":
                        tx = await this.state._contract.deleteOrder(id);
                        break;
                    case "AskRefund":
                        tx = await this.state._contract.askRefund(id);
                        break;
                    case "RefundBuyer":
                        const overrides = {
                            value: orderAmount,
                        }
                        tx = await this.state._contract.refundBuyer(id, overrides);
                        break;
                    default:
                        error = "Errore, non è prevista un'operazione " + expr;
                        break;
                }
                return [tx, error];
            } catch(err) {
                return [tx, err];
            }
        },

        _getSellers: async () => {
            const sellerAddresses = await this.state._contract.getSellers();
            return sellerAddresses;
        },
        
        _userIsSeller: async () => {
            const sellerAddresses = await this.state._getSellers();
            var userIsSeller = false;
            sellerAddresses.forEach((seller) => {
                if (seller.toLowerCase() === this.state.currentAddress)
                    userIsSeller = true;
            });
            this.setState({ userIsSeller });
        },

        _getQRCode: (order) => {
            console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaah");
            const buyer_address = order[1];
            const orderQRCode = buyer_address + ":"+parseInt(order[0]._hex);
            var QRCode = require('qrcode');
            var canvas = document.getElementById('qrcode');
            var opts = {
                margin: 1,
                width: 140,
                color: {
                    dark:"#131313",
                    light:"#e7e7e7"
                }
            }
            QRCode.toCanvas(canvas, orderQRCode, opts, function (error) {
                if (error)
                    return [null, error];
            })
            return null;
        },

        _getLog:async (id) =>  {
            return await this.state._contract.getLogsOfOrder(id);
        }
    };

    state = this.initialState;

    render() {
        return(
            <StateContext.Provider value={this.state}>
                {this.props.children}
            </StateContext.Provider>
        );
    }
  }