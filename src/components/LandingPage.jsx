import React, { useState, useContext } from 'react';
import {StateContext} from "./StateContext";
import {NoWalletDetected} from "./NoWalletDetected";
import {ConnectWallet} from "./ConnectWallet";
import { Loading } from './Loading';
import { ethers } from "ethers";
import avaxLogo from "../assets/avaxLogoMin.png";
import { useFetch } from "./useFetch";

async function createOrder(context, orderAmount, sellerAddress, setLoadingText) {
  try {
    const overrides = {
      value: ethers.utils.parseEther(orderAmount),
    }
    
    const tx = await context._contract.createOrder(sellerAddress, overrides);
    setLoadingText('Please wait for the transaction to be mined...'); // Here for now...
    const receipt = await tx.wait();
    if (receipt.status) {
      context._updateBalance();
    }
    return tx.hash;
  } catch(err) {
    console.log(err);
    throw err;
  }
}

function parseUrl() {
  const windowUrl = window.location.search;
  const params = new URLSearchParams(windowUrl);
  return "http://localhost:8000/orders/" + params.get('order');
}

export function LandingPage() {
  const [loadingText, setLoadingText] = useState('');
  const [hash, setHash] = useState('');
  const [hasNotified, setHasNotified] = useState(false);
  const [error, setError] = useState('');
  const context = useContext(StateContext);

  const [fetchUrl, setFetchUrl] = useState('');
  const [fetchMethod, setFetchMethod] = useState('');
  const [order, isLoaded] = useFetch(fetchUrl, fetchMethod, setHasNotified, setError);

  const confirmOrder = () => {
    setLoadingText('Please confirm the transaction on MetaMask');
    createOrder(context, order.price, order.sellerAddress, setLoadingText)
    .then(res => {
      setHash(res);
      setLoadingText('Notifying e-commerce...')
      order.confirmed = true;
      order.hash = res;
      setFetchMethod('PUT');
    })
    .catch(err => {
      setError(err.message + ' (Code: ' + err.code + ')');
      // Useful for testing without accepting transaction on MetaMask, just decline transaction
      // setHash('TransactionHashString');
      // setLoadingText('Notifying e-commerce...');
      // order.confirmed = true;
      // order.hash = 'TransactionHashString';
      // setFetchMethod('PUT');
    });
  }

  const UserData = () => {
    return (
      <div>
      <h1 className="landing-title">ShopChain</h1>
        <div className="user-data-landing blur">
          <p>Current address: &nbsp; {context.currentAddress}</p>
          <p>Current balance: &nbsp; {parseFloat(context.balance).toFixed(4)}<img src={avaxLogo} className="avaxLogoMin" alt="avax logo"/></p>
        </div>
      </div>
    );
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

  if (error) {
    return (<>
        <UserData />
        <h2>Error: {error}</h2>
      </>); 
  }
  else if (!isLoaded) {
    return (<>
      <UserData />
      <Loading />
    </>);
  } else {
    return (
      <>
      <UserData />

        { loadingText === '' && hash === '' &&
          <><p className="total-price">Payment amount: &nbsp; {order.price} AVAX<img src={avaxLogo} className="avaxLogoMin" alt="avax logo"/></p>
            <button onClick={confirmOrder} 
            className="cta-button basic-button create-transaction" id="createOrder">Create transaction</button></>
        }

        { loadingText !== '' && hash === '' &&
          <Loading text={loadingText} />
        }

        { hash !== '' &&
          <div className="transaction-hash">
            <h3>Transaction completed successfully!</h3>
            <p>Transaction hash: {hash}</p>
            <a href={"https://testnet.snowtrace.io/tx/" + hash} target="_blank" rel="noopener noreferrer">View on Snowtrace</a>
          </div>
        }

        { hash !== '' && !hasNotified &&
          <Loading text='Notifying e-commerce...' />
        }

        { hash !== '' && hasNotified &&
          <p style={{'fontSize': '2em', 'margin': '2em', 'textAlign': 'center'}}>E-commerce notified correctly</p>
        }
      </>
    );
  }
}