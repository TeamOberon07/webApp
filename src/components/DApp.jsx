import '../App.css';
import React from "react";

import { ethers } from "ethers";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { SwitchNetwork } from "./SwitchNetwork";
import { Buyer } from './Buyer';
import { Seller } from './Seller';
import { Loading } from './Loading';
import { Error } from './Error';

import { StateContext } from './StateContext';

export class DApp extends React.Component {
    constructor(props) {
        super(props);
        
        this.initialState = {
            sellerAddress: undefined,
            contractBalance: undefined,
            orders: undefined,
            totalOrders: undefined,
        };
        this.state = this.initialState;
    }

    static contextType = StateContext;

    async componentDidMount() {
        await this._initialize();
        this._setListenerMetamaksAccount();
        this._setListenerNetworkChanged();
    }

    // componentWillUnmount() {
    //     window.ethereum.on('accountsChanged', null);
    //     window.ethereum.on('chainChanged', null);
    // }

    render() {
        if (window.ethereum === undefined) {
            return <NoWalletDetected/>;
        }
        
        if (!this.context.currentAddress) {
            return <ConnectWallet connectWallet={() => this._initialize()}/>;
        }

        if (!this.state.orders || !this.context.balance) {
            return <Loading/>;
        }
        
        if (window.ethereum.chainId !== this.context.networks[this.context.ourNetwork].chainId || !this.context.rightChain) {
            return <SwitchNetwork switchNetwork={async () => await this._changeNetwork()}/>;
        }

        if (!this.context.userIsSeller) {
            return <Buyer   currentAddress={this.context.currentAddress}
                            balance={this.context.balance}
                            orders={this.state.orders}
                            askRefund={(id) => this._orderOperation(id, "AskRefund")}
                            State={this.context.orderState}
                    />;
        } else {
            return <Seller  currentAddress={this.context.currentAddress}
                            balance={this.context.balance}
                            orders={this.state.orders}
                            deleteOrder={(id) => this._orderOperation(id, "Delete")}
                            refundBuyer={(id, orderAmount) => this._orderOperation(id, "RefundBuyer", orderAmount)}
                            State={this.context.orderState}
                    />;
        }
    };

    async _setListenerMetamaksAccount() {
        window.ethereum.on('accountsChanged', async () => {
            this._initialize();
        })
    }

    async _setListenerNetworkChanged() {
        window.ethereum.on('chainChanged', async () => {
            if (window.ethereum.chainId === this.context.networks[this.context.ourNetwork].chainId)
                this.context._rightChain();
            else
                this.context._wrongChain();
        });
    }

    async _initialize() {
        await this.context._connectWallet();
        this._loadBlockchainData();
    }

    async _changeNetwork() {
        let error = await this.context._changeNetwork(this.context.ourNetwork);
        if (!error)
            this._loadBlockchainData();
        else 
            return <Error message={error}/>;
    }

    async _loadBlockchainData() {
        this._getContractBalance();
        this._getTotalOrders();
        this._initializeOrders();
        if(this.context.userIsSeller) {
            this._removeQRCode();
        }
    }
    // Spostato _getSellers, _userIsBuyer, _getQRCode in StateContext
    async _refreshInfo(tx) {
        const receipt = await tx.wait();
        if (receipt.status) {
            this._initializeOrders();
            this.context._updateBalance();
        }
    }

    async _initializeOrders() {
        let orders = [];
        try {
            orders = await this.context._contract.getOrdersOfUser(this.context.currentAddress);
        } catch (error) {
            return <Error message={error}/>;
        }
        this.setState({ orders });
    }

    //Funzioni confirmOrder, deleteOrder, askRefund e refundBuyer spostate in StateContext
    async _orderOperation(id, expr, orderAmount=0) {
        const res = await this.context._orderOperation(id, expr, orderAmount);
        if (res[0])
            this._refreshInfo(res[0]);
        else if (res[1])
            return <Error message={res[1]}/>;
    }
    
    async _getTotalOrders() {
        var totalOrders = await this.context._contract.getTotalOrders();
        totalOrders = totalOrders.toNumber();
        this.setState({ totalOrders });
    }

    async _getContractBalance() {
        var contractBalance = await this.context._contract.getBalance();
        const contractBalanceInAvax = ethers.utils.formatEther(contractBalance);
        contractBalance = contractBalanceInAvax.toString()+" AVAX";
        this.setState({ contractBalance });
    }

    async _removeQRCode() {
        let qrcode = document.getElementById('qrcode');
        if (qrcode) {
            var context = qrcode.getContext('2d');
            context.clearRect(0, 0, qrcode.width, qrcode.height);
        }
    }
}