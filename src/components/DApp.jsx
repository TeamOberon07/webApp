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
            //MetaMask non è stato rilevato
            return <NoWalletDetected/>;
        }
        
        if (!this.context.currentAddress) {
            //non è stato effettuato l'accesso ad un wallet via MetaMask
            return <ConnectWallet connectWallet={() => this._initialize()}/>;
        }

        if (window.ethereum.chainId !== this.context.networks[this.context.ourNetwork].chainId || !this.context.rightChain) {
            //il network al quale è connesso l'utente non è quello di deploy del contract
            return <SwitchNetwork switchNetwork={async () => await this._changeNetwork()}/>;
        }

        if (!this.state.orders || !this.context.balance) {
            //gli ordini o il bilancio non sono pronti e quindi la webApp si trova in stato di attesa
            return <Loading/>;
        }

        //la connessione al wallet è avvenuta correttamente ed i dati utente sono pronti ad essere mostrati
        //la pagina è pronta per essere renderizzata
        return(
            <div>
                <Header/>
                <div className='container'>
                    <Orders orders={this.state.orders} isBuyer={!this.context.userIsSeller} State={this.context.orderState}/>
                </div>
            </div>
        );
    };

    //listener del cambio account MetaMask per aggiornare i dati visualizzati
    async _setListenerMetamaskAccount() {
        window.ethereum.on('accountsChanged', async () => {
            this._initialize();
        })
    }

    //listener del cambio network su MetaMask per aggiornare la vista
    async _setListenerNetworkChanged() {
        window.ethereum.on('chainChanged', async () => {
            if (window.ethereum.chainId === this.context.networks[this.context.ourNetwork].chainId)
                this.context._rightChain();
            else
                this.context._wrongChain();
        });
    }

    //funzione di costruzione del componente
    async _initialize() {
        //connessione al wallet
        await this.context._connectWallet();
        //chiamata allo smart contract che ottiene gli ordini utente
        this._initializeOrders();
    }

    //funzione chiamata dal bottone "Change Network" che richiede lo switch alla rete corretta
    async _changeNetwork() {
        let error = await this.context._changeNetwork(this.context.ourNetwork);
        if (!error)
            this._initializeOrders();
        else 
            return <Error message={error}/>;
    }

    //funzione che interroga lo smart contract per ottenere gli ordini legati all'utente
    async _initializeOrders() {
        let ordersToSort = [];
        let orders;
        try {
            //gli ordini vengono ordinati cronologicamente dal più recente (id decrescente)
            ordersToSort = await this.context._contract.getOrdersOfUser(this.context.currentAddress);
            orders = [...ordersToSort];
            orders.reverse();
        } catch (error) {
            return <Error message={error}/>;
        }
        //gli ordini vengono salvati nello state
        this.setState({ orders });
    }
}