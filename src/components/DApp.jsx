import '../App.css';
import React from "react";

import { ethers } from "ethers";

import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { SwitchNetwork } from "./SwitchNetwork";
import { Buyer } from './Buyer';
import { Seller } from './Seller';
import { Loading } from './Loading';

import { StateContext } from './StateContext';

const orderAmount = "0.03";
const selectedSeller = 0;
const State = ['Created', 'Confirmed', 'Deleted', 'Asked Refund', 'Refunded'];

export class DApp extends React.Component {
    constructor(props) {
        super(props);
        
        this.initialState = {
            sellerAddress: undefined,
            contractBalance: undefined,
            orders: undefined,
            totalOrders: undefined,
            getQRCode: undefined,
            userIsBuyer: false,
        };

        this.state = this.initialState;
    }

    static contextType = StateContext;

    async componentDidMount() {
        await this._initialize();
        this._setListenerMetamaksAccount();
        this._setListenerNetworkChanged();
    }

    componentWillUnmount() {
        // window.ethereum.on('accountsChanged', null);
        // window.ethereum.on('chainChanged', null);
    }

    render() {

        if(window.ethereum === undefined) {
            return <NoWalletDetected/>;
        }
        
        if(!this.context.currentAddress) {
            return (
                <ConnectWallet connectWallet={() => this._initialize()}/>
            );
        }

        if(!this.state.orders || !this.context.balance) {
            return (
                <Loading/>
            );
        }
        
        if(window.ethereum.chainId !== this.context.networks[this.context.ourNetwork].chainId || !this.context.rightChain) {
            return (
                <SwitchNetwork switchNetwork={async () => await this._changeNetwork()}/>
            );
        }

        if(this.state.userIsBuyer) {
            return (
                <Buyer  currentAddress={this.context.currentAddress}
                        balance={this.context.balance}
                        seller={this.state.sellerAddress}
                        orders={this.state.orders}
                        askRefund={(id) => this._askRefund(id)}
                        createOrder={() => this._createOrder()}
                        orderAmount={orderAmount}
                        State={State}
                />
            );
        } else {
            return (
                <Seller currentAddress={this.context.currentAddress}
                        balance={this.context.balance}
                        orders={this.state.orders}
                        deleteOrder={(id) => this._deleteOrder(id)}
                        refundBuyer={(id, orderAmount) => this._refundBuyer(id, orderAmount)}
                        getQRCode={(id) => this._getQRCode(id)}
                        State={State}
                />
            );
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
        await this.context._changeNetwork(this.context.ourNetwork);
        this._loadBlockchainData();
    }

    async _loadBlockchainData() {
        this._getContractBalance();
        this._initializeSeller();
        this._getTotalOrders();
        this._initializeOrders();
        if(!this.state.userIsBuyer) {
            this._removeQRCode();
        }
    }

    async _initializeSeller() {
        const sellerAddresses = await this._getSellers();
        let sellerAddress = sellerAddresses[selectedSeller];
        this.setState({ sellerAddress });
        this._userIsBuyer();
    }

    async _userIsBuyer() {
        const userIsBuyer = this.context.currentAddress.toLowerCase() !== this.state.sellerAddress.toLowerCase();
        this.setState({ userIsBuyer });
    }

    async _getSellers() {
        const sellerAddresses = await this.context._contract.getSellers();
        return sellerAddresses;
    }

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
            console.log(error);
        }
        this.setState({ orders });
    }
    
    async _createOrder() {
        try {
            const overrides = {
                value: ethers.utils.parseEther(orderAmount),
            }
            const tx = await this.context._contract.createOrder(this.state.sellerAddress, overrides);
            const receipt = await tx.wait();
            if (receipt.status) {
                this._initializeOrders();
                this.context._updateBalance();
            }
        } catch(err) {
            console.log(err);
        }
    }

    async _confirmOrder(id) {
        try {
            const tx = await this.context._contract.confirmOrder(id);
            this._refreshInfo(tx);
        } catch(err) {
            console.log(err);
        }
    }

    async _deleteOrder(id) {
        try {
            const tx = await this.context._contract.deleteOrder(id);
            this._refreshInfo(tx);
        } catch(err) {
            console.log(err);
        }
    }

    async _askRefund(id) {
        try {
            const tx = await this.context._contract.askRefund(id);
            this._refreshInfo(tx);
        } catch(err) {
            console.log(err);
        }
    }

    async _refundBuyer(id, orderAmount) {
        try {
            const overrides = {
                value: orderAmount,
            }
            const tx = await this.context._contract.refundBuyer(id, overrides);
            this._refreshInfo(tx);
        } catch(err) {
            console.log(err);
        }
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

    async _getQRCode(index) {
        const orders = await this.context._contract.getOrdersOfUser(this.context.currentAddress);
        const order = orders.at(parseInt(index));
        const order_id = order.id;
        const buyer_address = order.buyer;
        const orderQRCode = buyer_address+":"+order_id;
        var QRCode = require('qrcode')
        var canvas = document.getElementById('qrcode')
        var opts = {
            margin: 1,
            width: 140,
            color: {
                dark:"#131313",
                light:"#e7e7e7"
            }
        }
        QRCode.toCanvas(canvas, orderQRCode, opts, function (error) {
            if (error) console.error(error)
        })
    }

    async _removeQRCode() {
        let qrcode = document.getElementById('qrcode');
        try {
            var context = qrcode.getContext('2d');
            context.clearRect(0, 0, qrcode.width, qrcode.height);
        } catch (error) {
            console.log(error);
        }
    }
}