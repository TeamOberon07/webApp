import React, { createContext } from "react";
import { ethers } from "ethers";
import Escrow from "../contracts/escrow.json";

export const StateContext = createContext();

export class StateProvider extends React.Component {

    initialState = {
        currentAddress: undefined,
        balance: undefined,
        contractAddress: "0x1648471B1b56bd703de37216Aa298077628Dcf27",
        ourNetwork: "fuji",
        rightChain: true,
        _contract: undefined,
        _provider: undefined,
        networks: {
            "fuji": {
                chainId: "0xa869",
                chainName: "Avalanche Fuji Testnet",
                nativeCurrency: {
                    name: "AVAX",
                    symbol: "AVAX",
                    decimals: 18
                },
                rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                blockExplorerUrls: ["https://testnet.snowtrace.io/"]
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
            } catch (err) {
                console.log(err.message);
            }
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

        _orderOperation: async (id, expr, orderAmount) => {
            try {
                var tx, error = undefined;
                switch(expr) {
                    case "Confirm":
                        tx = await this.state._contract.confirmOrder(id);
                        break;
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
                        console.log("Refund: ", tx);
                        break;
                    default:
                        error = "Errore, non è prevista un'operazione " + expr;
                        break;
                }
                return [tx, error];
            } catch(err) {
                return [tx, error];
            }
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