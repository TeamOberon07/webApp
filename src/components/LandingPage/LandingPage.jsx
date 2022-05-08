import React, { useState, useEffect, useContext } from 'react';
import {StateContext} from "../StateContext";
import {NoWalletDetected} from "../NoWalletDetected";
import {ConnectWallet} from "../ConnectWallet";
import { Loading } from '../Loading';
import { Error } from '../Error';
import { ethers } from "ethers";
import { useFetch } from "./useFetch";
import { UserData } from "./UserData";
import { Header } from "../Header";
import { OrderData } from './OrderData';
import { TxHash } from './TxHash';
import { Notify } from './Notify';

async function createOrder(context, orderAmount, sellerAddress, afterConfirm) {
  try {
    const overrides = {
      value: ethers.utils.parseEther(orderAmount),
    }
    
    const tx = await context._contract.createOrder(sellerAddress, overrides);
    afterConfirm();
    const receipt = await tx.wait();
    if (receipt.status) {
      context._updateBalance();
    }
    return tx.hash;
  } catch(err) {
      // return <Error message={err}/>;
      throw err;
  }
}

export function parseUrl() {
  const windowUrl = window.location.search;
  const params = new URLSearchParams(windowUrl);
  return "http://localhost:8000/orders/" + params.get('order');
}

export function LandingPage() {
  const [loadingText, setLoadingText] = useState('');
  const [hash, setHash] = useState('');
  const [hasNotified, setHasNotified] = useState(false);
  const [error, setError] = useState('');
  const [isOnChain, setIsOnChain] = useState(false);
  const [ecommIsNotSynched, setEcommIsNotSynched] = useState(false);
  const context = useContext(StateContext);

  const [fetchUrl, setFetchUrl] = useState('');
  const [fetchMethod, setFetchMethod] = useState('');
  const [order, isLoaded] = useFetch(fetchUrl, fetchMethod, setHasNotified, setError);

  useEffect(() => {
    context._setListenerMetamaksAccount();
  }, []);

  const confirmOrder = () => {
    setLoadingText('Please confirm the transaction on MetaMask');
    createOrder(context, order.price, order.sellerAddress, () => setLoadingText('Please wait for the transaction to be mined...'))
    .then(res => {
      setHash(res);
      // setLoadingText('Notifying e-commerce...');
      order.confirmed = true;
      order.hash = res;
      setFetchMethod('PUT');
    })
    .catch(err => {
      setLoadingText('');
      setError(err.message + ' (Code: ' + err.code + ')');
      // Useful for testing without accepting transaction on MetaMask, just decline transaction
      // setHash('TransactionHashString');
      // setLoadingText('Notifying e-commerce...');
      // order.confirmed = true;
      // order.hash = 'TransactionHashString';
      // setFetchMethod('PUT');
    });
  }

  if(window.ethereum === undefined) {
    return <NoWalletDetected/>;
  }
  
  if(!context.currentAddress) {
    return (
      <ConnectWallet connectWallet={() => context._connectWallet()}/>
    );
  }

  // Just to avoid running fetch before checking for wallet, might not be necessary
  if(fetchUrl ==='') {
    setFetchUrl(parseUrl());
    setFetchMethod('GET');
  }

  if(error && error.includes('Order on-chain')) {
    const err = error;
    setError(null);
    setIsOnChain(true);
    setHash(order.hash);
    if(err === 'Order on-chain & !notified') {
      setEcommIsNotSynched(true);
      // setLoadingText('Notifying e-commerce...');
      setFetchMethod('PUT');
    }
  }

  if (!isLoaded) {
    return (<>
      <Header currentAddress={context.currentAddress}
              balance={context.balance}
      />
      <Loading />
    </>);
  } else if(isOnChain) {
    return (<>
      <Header currentAddress={context.currentAddress}
              balance={context.balance}
      />
      <div class="tx-message">
        <p>Tx is already on-chain!</p>
      </div>
      <TxHash hash={hash} />

      { !error && ecommIsNotSynched && 
      <Notify hasNotified={hasNotified} />
      }

      { error && 
        <Error message={error} />
        }
      </>);
  } else {
    return (<>
      <Header currentAddress={context.currentAddress}
              balance={context.balance}
      />

      <OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />

        { order.confirmed && <>
          <h3>Transaction completed successfully!</h3>
          <TxHash hash={hash} />
          </>
        }
        
        {!error && order.confirmed && 
          <Notify hasNotified={hasNotified} />
        }

        { error && 
          <Error message={error} />
        }
    </>);
  }
}