import React, { createContext } from "react";
import { ethers } from "ethers";
import ERC20_ABI from "../assets/ERC20.json";
import TJROUTER_ABI from "../assets/router.json";
import Escrow from "../contracts/SCEscrow.json";

export const StateContext = createContext();

const stable = 0
const avaxToStable = 1;
const tokenToStable = 2;

export class StateProvider extends React.Component {

    state = {
        currentAddress: undefined,
        balance: undefined,
        contractAddress: "0xF2A05049352dFAA2BdefE1357cc2beD4486E2E5e",
        listedTokensAddress: "0x5cb76c0f1deBba7E974c8e114Cd91e7A51abD938",
        stablecoinAddress: undefined,
        ourNetwork: "rinkeby",
        rightChain: true,
        _contract: undefined,
        _provider: undefined,
        userIsSeller: false,
        orderState: ['Created', 'Shipped', 'Confirmed', 'Deleted', 'Asked Refund', 'Refunded'],
        amountApproved: undefined,
        orderStateChanged: false,
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
    
        _setListenerMetamaskAccount: () => {
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

        _getOrderById: async (id, order) => {
            if(this.state._contract){
                const order = await this.state._contract.getOrder(id);
                return order
            }
            return order;
        },

        _callCreateOrder: async (functionToCall, tokenAddress, orderAmount, maxAmountIn, sellerAddress, afterConfirm) => {
            try {
              const amountOut = ethers.utils.parseEther(orderAmount);
              let tx;
              if (functionToCall === stable) {
                tx = await this.state._contract.createOrderWithStable(sellerAddress, amountOut);
              } else 
              if (functionToCall === avaxToStable) {
                tx = await this.state._contract.createOrderWithAVAXToStable(sellerAddress, amountOut, { value: maxAmountIn });
              } else {
                tx = await this.state._contract.createOrderWithTokensToStable(sellerAddress, amountOut, maxAmountIn, tokenAddress);
              }
              afterConfirm();
              const receipt = await tx.wait();
              if (receipt.status) {
                this.state._updateBalance();
              }
              return tx.hash;
            } catch(err) {
                // return <Error message={err}/>;
                throw err;
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
                        break;
                    default:
                        error = "Errore, non è prevista un'operazione " + expr;
                        break;
                }
                await tx.wait()
                await this.state._connectWallet();
                this.state._setListenerMetamaskAccount();
                this.setState({ orderStateChanged: true });
                return [tx, error];
            } catch(err) {
                throw err;
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

        _isAuthorizedSeller: async (sellerAddress) => {
            const sellers = await this.state._getSellers();
            return sellers.includes(sellerAddress);
        },

        _getQRCode: (order) => {
            const buyer_address = order[1];
            const orderQRCode = buyer_address + ":"+parseInt(order[0]._hex);
            var QRCode = require('qrcode');
            var opts = {
                margin: 1,
                width: 140,
                color: {
                    dark:"#131313",
                    light:"#e7e7e7"
                }
            }
            var canvas = document.getElementById("qrcode");
            QRCode.toCanvas(canvas, orderQRCode, opts, function (error) {
                if (error)
                    return [null, error];
            })
            document.getElementById("qrcode-container").appendChild(canvas);
            return null;
        },

        _getLog: async (id) =>  {
            if(this.state._contract){
                const logs =  await this.state._contract.getLogsOfOrder(id);
                return logs;
            }
            return [];
        },

        _getERC20Balance: async (token) => {
            let erc20contract = new ethers.Contract(token.address, ERC20_ABI, this.state._provider.getSigner(0));
            const balanceInWei = await erc20contract.balanceOf(this.state.currentAddress);
            return ethers.utils.formatEther(balanceInWei);
        },

        _approveERC20: async (tokenAddress, amount) => {
            let erc20contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.state._provider.getSigner(0));
            let tx = await erc20contract.approve(this.state.contractAddress, amount);
            tx.wait().then( () => {
                this.setState({
                    amountApproved: true,
                })
            }).catch(() => {
                this.setState({
                    amountApproved: false,
                })
            })
        },

        _ERC20isApproved: async (tokenAddress, amount) => {
            let erc20contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.state._provider.getSigner(0));
            let allowance = await erc20contract.allowance(this.state.currentAddress, this.state.contractAddress);
            if (allowance >= amount) {
                return true;
            } else {
                return false;
            }
        },

        _setOrderStateChangedFalse: () => {
            this.setState({
                orderStateChanged: false,
            })
        },

        _getAmountsIn: async (token, amountOut) => {
            let tokenOut = await this.state._contract.STABLECOIN();
            this.setState({
                stablecoinAddress: tokenOut,
            })
            let maxAmountIn;
            amountOut = ethers.utils.parseUnits(amountOut, 18);
            if (token.address.toLowerCase() === tokenOut.toLowerCase()) {
                return amountOut;
            } else {
                let tokenIn = token.address;
                let routerAddress = await this.state._contract.tjRouter();
                let WAVAX = await this.state._contract.WAVAX();
                let IJoeRouter = new ethers.Contract(routerAddress, TJROUTER_ABI, this.state._provider.getSigner(0));
                const avaxPath = [
                    WAVAX,
                    tokenOut
                ]
                const tokenPath = [
                    tokenIn,
                    WAVAX,
                    tokenOut
                ]
                if (token.symbol === "AVAX" || token.symbol === "WAVAX") {
                    maxAmountIn = await IJoeRouter.getAmountsIn(amountOut, avaxPath);
                } else {
                    maxAmountIn = await IJoeRouter.getAmountsIn(amountOut, tokenPath);
                }
                return maxAmountIn[0];
            }
        },
    };

    render() {
        return(
            <StateContext.Provider value={this.state}>
                {this.props.children}
            </StateContext.Provider>
        );
    }
  }