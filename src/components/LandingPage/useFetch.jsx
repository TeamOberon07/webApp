import { useEffect, useState, useContext } from 'react';
import { StateContext } from '../StateContext';

async function _getSellers(context) {
  const sellerAddresses = await context._contract.getSellers();
  return sellerAddresses;
}

async function isAuthorizedSeller(context, sellerAddress) {
  const sellers = await _getSellers(context);
  return sellers.includes(sellerAddress);
}

const isValidAmount = (price) => {
  const reg = new RegExp('[+-]?([0-9]*[.])?[0-9]+$');
  if (reg.test(price) && price > 0) {
    return true;
  } else {
    return false;
  }
}

export function useFetch (url, method, setHasNotified, setError) {
    const [order, setOrder] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const context = useContext(StateContext);

    const checkOrder = (order) => {
      if(order.confirmed === true) {
        // NEED to actually check using res.hash
        setError('Order already in chain, Tx hash: ' + order.hash);
        setIsLoaded(true);
      } else if (false){
        // MUST Check if order already in chain but e-comm doesn't know it
        // something like:
        // const hash = getHash(order); (contract function)
        // if(hash){
        //   setError('Order already in chain with hash:' + hash);
        //   setIsLoaded(true);
        //THEN try to contact e-comm
        // POSSIBLE SOLUTION: 
        // setError('Order already in chain')
        // THEN on LandingPage something like
        // if (error === 'Order already in chain){
        //   setMethod('PUT');
        // }
      } else {
        order.price = order.price.toString();
        isAuthorizedSeller(context, order.sellerAddress)
        .then(res => {
          if (res) {
            if (isValidAmount(order.price)) {
              setOrder(order);
              setIsLoaded(true);
            } else {
              setError('Invalid price format (price: ' + order.price + ')');
              setIsLoaded(true);
            }
          }
          else {
            setError('Seller Address not recognized (Address: ' + order.sellerAddress + ')');
            setIsLoaded(true);
          }
        })
        .catch(err => {
          setError('Seller Address not recognized (Address: ' + order.sellerAddress + ')');
          setIsLoaded(true);
        });
      }
    }
   
    useEffect( () => {
//      setTimeout(() => {

      //Associate AbortController w/ fetch request, then use it to stop fetch
      const abortCont = new AbortController();

      if(url) {
      let fetchOptions = {};
      if(method === 'GET') {
        fetchOptions = {
          signal: abortCont.signal
        }
      } else if(method === 'PUT') {
        //check order.confirmed && order.hash, => setError
        fetchOptions = { 
          method: 'PUT',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
          signal: abortCont.signal
        }
      }

      fetch(url, fetchOptions)
      .then(res => {
        if(!res.ok) {
              throw Error('Fetch failed: (!res.ok)'); //reached server and got a response
        }
        return res.json()
      })
      .then(
        (res) => {
          if(method === 'GET') {
            checkOrder(res);
          }
          else if(method === 'PUT') {
            setHasNotified(true);
          }
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          if(error.name === 'AbortError') {
            // ...
            console.log('fetch aborted (onRejected)');
          }
          else {
            setError(error);
            setIsLoaded(true);
          }
        }
      ).catch(error => {
        if(error.name === 'AbortError') {
          // ...
          console.log('fetch aborted (catch)');
        }
        else {
          setError(error);
          setIsLoaded(true);
        };
      })
    }
  
        //useEffect cleanup + abort controller to avoid trying to update the state of unmounted component
        // but without react-router ...
        return () => {
          abortCont.abort()
          console.log('return useFetch');
        };
//      }, 5000);
    }, [url, method])

    return [order, isLoaded];
}