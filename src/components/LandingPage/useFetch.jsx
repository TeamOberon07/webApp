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
export { isValidAmount }; // Necessary for unit testing

export function useFetch (url, method, setHasNotified, setError) {
    const [order, setOrder] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const context = useContext(StateContext);

    const checkOrder = (order) => {
      const setInChain = (error) => {
        setOrder(order); // in chain => already checked
        setError(error);
        setIsLoaded(true);
      };
      if(order.confirmed === true) {
        // NEED to actually check using res.hash
        // if(getHash(order.hash)) { // check in chain
          setInChain('Order in chain');
        // }
        // else {
        //   setError('e-comm is wrong');
        //   setLoaded(true);
        // }
      } else if (false) { // if(!order.confirmed && getHash(order.hash)) (order in chain but e-comm not notified)
        order.hash = '0x3a99c01bc896891e324a62bf687843631d17164acd3cfbb341a93198744f3801'; // GET actual hash 
        order.confirmed = true;
        setInChain('Order in chain & !notified');
      } else {
        order.price = order.price.toString();
        isAuthorizedSeller(context, order.sellerAddress)
        .then(res => {
          if (res) {
            if (isValidAmount(order.price)) {
              setOrder(order);
            } else {
              setError('Invalid price format (price: ' + order.price + ')');
            }
          }
          else {
            setError('Seller Address not recognized (Address: ' + order.sellerAddress + ')');
          }
        })
        .catch(err => {
          setError(err);
        })
        .finally(() => 
          setIsLoaded(true)
        );
      }
    }
   
    useEffect( () => {
    //  setTimeout(() => {

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
              throw Error(`${method} request failed (Code ${res.status}: ${res.statusText})`); //reached server and got a response
        }
        return res.json();
      })
      .then(
        (res) => {
          if(method === 'GET') {
            checkOrder(res);
          }
          else if(method === 'PUT') {
            setHasNotified(true);
          }
        })
        .catch(error => {
        if(error.name === 'AbortError') {
          // ...
          console.log('fetch aborted (catch)');
        }
        else {
          setError(error.message);
          setIsLoaded(true);
        };
      })
    }
  
        //useEffect cleanup + abort controller to avoid trying to update the state of unmounted component
        return () => {
          abortCont.abort();
          //console.log('return useFetch');
        };
    //  }, 3000);
    }, [url, method])

    return [order, isLoaded];
}