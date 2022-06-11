import React, { createContext } from "react";
import { ethers } from "ethers";
import ERC20_ABI from "../assets/ERC20.json";
import TJROUTER_ABI from "../assets/router.json";
import Escrow from "../contracts/SCEscrow.json";

//componente di tipo provider che fornisce diverse variabili utilizzate dalle varie pagine
//ed offre funzioni che si interfacciano con lo smart contract
export const StateContext = createContext();
export class StateProvider extends React.Component {

    state = {
        currentAddress: undefined,
        balance: undefined,
        contractAddress: "0xCB99efB19481eF91F3296a6E6a61caA7F02Af65D",
        stablecoinAddress: undefined,
        ourNetwork: "rinkeby",
        rightChain: true,
        _contract: undefined,
        _provider: undefined,
        userIsSeller: false,
        orderState: ['Created', 'Shipped', 'Confirmed', 'Deleted', 'Asked Refund', 'Refunded'],
        orderOperations: ["Delete", "SetAsShipped", "RefundBuyer", "AskRefund"],
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
                blockExplorerUrls: ["https://rinkeby.etherscan.io"]
            }
        },

        //funzione di connessione al wallet
        _connectWallet: async () => {
            try {
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
                    //l'address con la quale è stato effettuato l'accesso viene salvata nello stato
                    currentAddress: currentAddress,
                });
                this.setState({
                    //un booleano che indica la presenza sul giusto network
                    rightChain: window.ethereum.chainId === this.state.networks[this.state.ourNetwork].chainId,
                })

                this.state._setStablecoinAddress(); 
                this.state._updateBalance();
                this.state._userIsSeller();
            } catch(err) {
                return err;
            }
        },
    
        //richiesta di cambio network inoltrata a MetaMask
        _changeNetwork: async (networkName) => {
            try {
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: this.state.networks[networkName].chainId }]
                });
            } catch (err) {
                // This error code indicates that the chain has not been added to MetaMask
                if (err.code === 4902) {
                  await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            ...this.state.networks[networkName]
                        }
                    ]
                  });
                }
            }
            window.location.reload()
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
            window.ethereum.on('accountsChanged', async () => {
                await this.state._connectWallet();
            })
        },
    
        _setListenerNetworkChanged: () => {
            window.ethereum.on('chainChanged', () => {
                if (window.ethereum.chainId === this.state.networks[this.state.ourNetwork].chainId)
                    this.state._rightChain();
                else
                    this.state._wrongChain();
            });
        },
    
        _updateBalance: async () => {
            const balanceInWei = await this.state._provider.getBalance(this.state.currentAddress, "latest");
            const balanceInAvax = ethers.utils.formatEther(balanceInWei);
            const balance = balanceInAvax.toString()+" AVAX";
            this.setState({ balance });
        },

        //richiesta di un ordine allo smart contract dato il suo id
        _getOrderById: async (id) => {
            if(this.state._contract){
                const order = await this.state._contract.getOrder(id);
                return order
            }
            return [];
        },

        //funzione di creazione dell'ordine sulla blockchain
        _callCreateOrder: async (functionToCall, tokenAddress, orderAmount, maxAmountIn, sellerAddress, afterConfirm) => {
            const stable = 0
            const avaxToStable = 1;
            try {
              const amountOut = ethers.utils.parseEther(orderAmount);
              let tx;
              if (functionToCall === stable) {
                //l'utente ha pagato in stable coin
                tx = await this.state._contract.createOrderWithStable(sellerAddress, amountOut);
              } else 
              if (functionToCall === avaxToStable) {
                //l'utente ha pagato in AVAX o altra coin della chain
                tx = await this.state._contract.createOrderWithAVAXToStable(sellerAddress, amountOut, { value: maxAmountIn });
              } else {
                //l'utente ha pagato con altro token
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

        //chiamata alla funzione del contract corrispondente alla richiesta
        _orderOperation: async (id, expr, orderAmount) => {
            try {
                var tx, error = undefined;
                switch(expr) {
                    case "Delete":
                        tx = await this.state._contract.deleteOrder(id);
                        break;
                    case "SetAsShipped":
                        tx = await this.state._contract.shipOrder(id);
                        break;
                    case "RefundBuyer":
                        tx = await this.state._contract.refundBuyer(id, orderAmount);
                        break;
                    case "AskRefund":
                        tx = await this.state._contract.askRefund(id);
                        break;
                    default:
                        error = "Errore, non è prevista un'operazione " + expr;
                        break;
                }
                await tx.wait()
                await this.state._connectWallet();
                this.state._setListenerMetamaskAccount();

                //impostando orderStateChanged a true si permette il refresh e l'aggiornamento dei dati
                this.setState({ orderStateChanged: true });
                return [tx, error];
            } catch(err) {
                throw err;
            }
        },

        //funzione che ottiene la lista di Seller registati sulla piattaforma
        _getSellers: async () => {
            const sellerAddresses = await this.state._contract.getSellers();
            return sellerAddresses;
        },
        
        //check e set del ruolo dell'utente (Seller o Buyer)
        _userIsSeller: async () => {
            const sellerAddresses = await this.state._getSellers();
            var userIsSeller = false;
            sellerAddresses.forEach((seller) => {
                if (seller.toLowerCase() === this.state.currentAddress)
                    userIsSeller = true;
            });
            this.setState({ userIsSeller });
        },

        //check del ruolo dell'utente (Seller o Buyer)
        _isAuthorizedSeller: async (sellerAddress) => {
            const sellers = await this.state._getSellers();
            return sellers.includes(sellerAddress);
        },

        //costruzione del QR contenente "{buyer_address}:{ID_ordine}"
        _getQRCode: (order) => {
            const buyer_address = order[1];
            const orderQRCode = buyer_address + ":" + parseInt(order[0]._hex);
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

        //richiesta dei log di un ordine allo smart contract
        _getLog: async (id) =>  {
            if(this.state._contract){
                const logs =  await this.state._contract.getLogsOfOrder(id);
                return logs;
            }
            return [];
        },

        _getERC20Balance: async (tokenAddress) => {
            let erc20contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.state._provider.getSigner(0));
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

        //la pagina è stata aggiornata e orderState è uguale a quello sul contract
        _setOrderStateChangedFalse: () => {
            this.setState({
                orderStateChanged: false,
            })
        },

        _getAmountsIn: async (token, amountOut) => {
            let tokenOut = this.state.stablecoinAddress;
            let maxAmountIn;
            amountOut = ethers.utils.parseUnits(amountOut, 18);
            console.log(tokenOut);
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

        //rappresentatore degli address in forma accorciata
        _cutAddress: (address) => {
            return address.substring(0,6)+ "..." +address.substring(address.length-6, address.length);
        },

        //funzione che chiede l'address della stable coin direttamente allo smart contract per poi settarla nello stato
        _setStablecoinAddress: async () => {
            let stablecoinAddress = await this.state._contract.STABLECOIN();
            this.setState({ stablecoinAddress });
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