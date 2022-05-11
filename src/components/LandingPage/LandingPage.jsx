import React, { useState, useEffect, useContext } from 'react';
import { StateContext } from "../StateContext";
import { NoWalletDetected } from "../NoWalletDetected";
import { ConnectWallet } from "../ConnectWallet";
import { Loading } from '../Loading';
import { Error } from '../Error';
import { ethers } from "ethers";
import { useFetch } from "./useFetch";
import { Header } from "../Header";
import { OrderData } from './OrderData';
import { TxHash } from './TxHash';
import { Notify } from './Notify';

const stable = 0
const avaxToStable = 1;
const tokenToStable = 2;

export function parseUrl() {
  const windowUrl = window.location.search;
  const params = new URLSearchParams(windowUrl);
  console.log("http://localhost:8000/orders/" + params.get('order'))
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

  useEffect(async () => {
    await context._connectWallet();
    await context._setListenerMetamaksAccount();
  }, []);

  const approve = async (token, maxAmountIn) => {
    await context._approveERC20(token.address,maxAmountIn);
  }

  const createOrder = async (token, maxAmountIn) => {
    let functionToCall;
    if (token.address === context.stablecoinAddress) {
      functionToCall = stable;
    } else 
    if (token.name === "AVAX" && token.address === "NULL") { 
      functionToCall = avaxToStable;
    } else {
      functionToCall = tokenToStable;
    }
    setLoadingText('Please confirm the transaction on MetaMask');
    await context._callCreateOrder(
      functionToCall, 
      token.address, 
      order.price, 
      maxAmountIn, 
      order.sellerAddress, 
      () => setLoadingText('Please wait for the transaction confirmation...')
    ).then(res => {
      setHash(res);
      // setLoadingText('Notifying e-commerce...');
      order.confirmed = true;
      order.hash = res;
      setFetchMethod('PUT');
    })
    .catch(err => {
      setLoadingText('');
      throw functionToCall;
      // setError("DIOHANE" + err.message + ' (Code: ' + err.code + ')');
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

  if(error == "GET request failed (Code 404: Not Found)") {
    window.location.href = '/';
  }
  
  
  if(!context.currentAddress) {
    return (
      <ConnectWallet connectWallet={async() => {
        await context._connectWallet();
      }}/>
      );
    } else {
    if (order.sellerAddress && order.buyerAddress && context.currentAddress)
      if (
        order.sellerAddress.toLowerCase() !== context.currentAddress.toLowerCase() &&
        order.buyerAddress.toLowerCase() !== context.currentAddress.toLowerCase()) 
      {
        window.location.href = '/';
      }
  }

  // Just to avoid running fetch before checking for wallet, might not be necessary
  if(fetchUrl === '') {
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
  } 
  else if (isOnChain) {
      return (<>
        <Header currentAddress={context.currentAddress}
                balance={context.balance}
        />
        <div className="tx-message">
          <p>Tx is already on-chain!</p>
        </div>
        <TxHash hash={hash} />

        { !error && ecommIsNotSynched && 
        <Notify hasNotified={hasNotified} />
        }

        {/* { error && 
          <Error message={error} />
        } */}
        </>);
  } else {
    if (!error)
      return (<>
        <Header currentAddress={context.currentAddress}
                balance={context.balance}
        />

        <OrderData order={order} createOrder={createOrder} approve={approve} loadingText={loadingText} />

          { order.confirmed && <>
            <h3>Transaction completed successfully!</h3>
            <TxHash hash={hash} />
            </>
          }
          
          {!error && order.confirmed && 
            <Notify hasNotified={hasNotified} />
          }

          {/* { error && 
            <Error message={error} />
          } */}
      </>);
  }
}