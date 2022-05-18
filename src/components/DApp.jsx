import '../App.css';
import React from "react";
import { Header } from './Header';
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { SwitchNetwork } from "./SwitchNetwork";
import { Loading } from './Loading';
import { Error } from './Error';

import { StateContext } from './StateContext';
import { Orders } from './Orders';

export class DApp extends React.Component {
    constructor(props) {
        super(props);
        
        this.initialState = {
            sellerAddress: undefined,
            orders: undefined,
        };
        this.state = this.initialState;
    }

    static contextType = StateContext;

    async componentDidMount() {
        await this._initialize();
        this._setListenerMetamaskAccount();
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

        if (window.ethereum.chainId !== this.context.networks[this.context.ourNetwork].chainId || !this.context.rightChain) {
            return <SwitchNetwork switchNetwork={async () => await this._changeNetwork()}/>;
        }

        if (!this.state.orders || !this.context.balance) {
            return <Loading/>;
        }

        return(
            <div>
                <Header/>
                <div className='container'>
                    <Orders orders={this.state.orders} isBuyer={!this.context.userIsSeller} State={this.context.orderState}/>
                </div>
            </div>
        );
    };

    async _setListenerMetamaskAccount() {
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
        this._initializeOrders();
    }

    async _changeNetwork() {
        let error = await this.context._changeNetwork(this.context.ourNetwork);
        if (!error)
            this._initializeOrders();
        else 
            return <Error message={error}/>;
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
            return <Error message={error}/>;
        }
        this.setState({ orders });
    }

    async _orderOperation(id, expr, orderAmount=0) {
        const res = await this.context._orderOperation(id, expr, orderAmount);
        if (res[0])
            this._refreshInfo(res[0]);
        else if (res[1])
            return <Error message={res[1]}/>;
    }
}