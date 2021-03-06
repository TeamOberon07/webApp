import React from "react";
import { ethers } from "ethers";
import tokenLogo from "../assets/usdtLogo.png";
import { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";

//componente che costruisce la tabella di visualizzazione degli ordini
//e ne applica i filtri
export function Orders({orders, isBuyer, State}) {

  let content, view, userIndex, amount, tvl=0;
  // style foreach different state
  const Icon = ['check_circle', 'local_shipping', 'verified', 'delete', 'assignment_return', 'reply'];
  const Color = [
    { color: 'rgb(105 235 115)' }, // green 
    { color: 'rgb(255 255 255)' }, //white 
    { color: 'rgb(77 165 255)' }, // blue
    { color: 'rgb(227 85 86)' }, // red
    { color: 'rgb(242 245 70)' }, // yellow
    { color: 'white' }
  ];

  //variabile utilizzata per il paginator, permette di memorizzare in quale pagina si trova l'utente che ha un numero alto(>20) di ordini 
  const [first, setFirst] = useState(0);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [errorFilter, setErrorFilter] = useState("");

  useEffect(() => {
    //per aggiornare la pagina al cambiamento di filteredOrders
  }, [filteredOrders]);

  if (isBuyer) {
    userIndex = 2;
    view = "Seller";
  } else {
    userIndex = 1;
    view = "Buyer"
  }

  //applicazione dei filtri alla lista totale degli ordini utente
  function applyFilters(e){
    //impedire il submit permette di non aggiornare la pagina in automatico
    e.preventDefault();

    //lettura dello stato selezionato per il filtro
    var state = parseInt(document.getElementById("FilterState").value);

    if(errorFilter !== "Inserted address is not valid" && document.getElementById("FilterAddress").value !== ""){
      //se è stata dichiarata un'address valida nella sezione Address dei filtri
      var res = filterOrdersByAddress(document.getElementById("FilterAddress").value);
      if(res.length !== 0){
        filterOrdersByState(res, state);
      }
    }
    else
      filterOrdersByState(orders, state);
  }
  
  //filtraggio per address degli ordini
  function filterOrdersByAddress(address) {
    let res = [];
    orders.forEach(element => {
      if (element[1].toString() === address || element[2].toString() === address) {
        res.push(element);
      }
    });
    setFilteredOrders(res);
    return res;
  }

  //filtraggio per stato degli ordini
  function filterOrdersByState(ordersToFilter, state) {
    let res = [];
    ordersToFilter.forEach(element => {
      if (state === -1 || element[4] === state) {
        //se lo stato scelto è "any" o corrisponde a quello dell'ordine
        res.push(element);
      }
    });
    setFilteredOrders(res);
    if(res.length === 0){
      //se la ricerca non ha prodotto alcun risultato mostrare tutti gli ordini con un messaggio di errore
      setErrorFilter("No order found for specified filters");
      document.getElementById("filters").style.marginBottom = "0";
    }
    else{
      //rimozione messaggio di errore
      setErrorFilter("");
      document.getElementById("filters").style.marginBottom = "1.5em";
    }
  }

  //funzione per copiare l'indirizzo nel copia-incolla dell'utente
  function copyAddress(address, id) {
    var copyIcon = document.getElementById(id);
    navigator.clipboard.writeText(address);
    copyIcon.innerHTML = "task";
    copyIcon.classList.add("light-blue");
    setTimeout(function () {
      copyIcon.innerHTML = "file_copy";
      copyIcon.classList.remove("light-blue");
    }, 5000);
  }
  
  //funzione di costuzione della riga della tabella in base all'ordine specifico passato
  function visualizeOrder(order) {
    const res = <tr key={order[0].toString()}>
            <td aria-label="Id">{order[0].toString()}</td>
            <td aria-label="Address">
              <span data-testid="copyIcon" id={ "copyIcon" + order[0].toString() }
                onClick={ () => copyAddress(order[userIndex].toString(), "copyIcon" + order[0].toString()) } 
                className="material-icons copy">
                file_copy
              </span>
              {
                order[userIndex].toString().substring(0,6)
                +"..."+
                order[userIndex].toString().substring(
                  order[userIndex].toString().length-6,
                  order[userIndex].toString().length
                )
              }
            </td>
            {(() => {
              amount = ethers.utils.formatEther(order[3].toString());
            })()}
            <td aria-label="Amount">${amount}</td>
            <td aria-label="Icon">
              {State[order[4]]}
              <span className="material-icons" style={Color[order[4]]}>{Icon[order[4]]}</span>
            </td>
            <td className = "order-button-cell">
              <NavLink to="/order-page" state={{ id: parseInt(order[0]) }} className = "cta-button order-button blur-light">
                See order
              </NavLink>   
            </td>
            {(() => {
              let state = State[order[4]];
              if(state === "Created" || state === "Shipped") {
                //quando l'ordine si trova in uno di questi stato significa che il loro valore
                //si trova ancora versato nello smart contract (e quindi nella tvl)
                tvl += parseFloat(amount)
              }
            })()}
          </tr>;
    return res;
  }

  //selezione degli ordini da mostrare in base al valore di filteredOrders
  //se contiene ordini significa che il filtro è attivo
  //vengono presi i primi 20 a partire da first (paginator)
  if (filteredOrders.length !== 0)
    content = filteredOrders.slice(first, first+20).map((element) => (visualizeOrder(element)));
  else if (orders.length)
    content = orders.slice(first, first+20).map((element) => (visualizeOrder(element)));

  return (
    <div className="box">
      <h1 className="page-title">Your Orders</h1>
      <form id="filters">
        <div id="filters-and-labels">
          <div className="button-label-select">
            <label className="FilterLabel" id="FilterAddressLabel">Address:</label>
            <div id="buyerAddressFilter">
              <input role="FilterAddress" type="text" name="FilterAddress" id="FilterAddress" onBlur={() => {
                const address = document.getElementById("FilterAddress").value;
                if (address === "" || ethers.utils.isAddress(address)) {
                  setErrorFilter("");
                } else {
                  setErrorFilter("Inserted address is not valid");
                }
              }}>
              </input>
            </div>
          </div>
          <div className="button-label-select" id="FilterStateDiv">
            <label className="FilterLabel" id="FilterStateLabel">State:</label>
            <div id="stateFilter">
              <select role ="FilterState" name="FilterState" id="FilterState">
                <option value="-1" key="-1">Any</option>
                <option value="0" key="0">Created</option>
                <option value="1" key="1">Shipped</option>
                <option value="2" key="2">Confirmed</option>
                <option value="3" key="3">Deleted</option>
                <option value="4" key="4">Asked Refund</option>
                <option value="5" key="5">Refunded</option>
              </select>
            </div>
          </div>
        </div>
        <div id="filterButtons">
          <button role="ApplyFilters" className="cta-button basic-button blur" onClick = {(e) => applyFilters(e)}><span className="material-icons">filter_alt</span></button>
          <button role="ResetFilters" className="cta-button basic-button blur" onClick = {() => setFilteredOrders([])/*svuotando questa variabile la tabella rappresenterà tutti gli ordini utente*/ }><span className="material-icons">filter_alt_off</span></button>
        </div>
      </form> 
      <p className="errorP">{errorFilter}</p>
      <div className="tableLabel">
        <p className="TVL">Your&nbsp;<abbr title = "Total Value Locked">TVL</abbr>: ${parseFloat(tvl.toFixed(4))}<img src={tokenLogo} className="tokenLogoMin" alt="token logo"/></p>
      </div>
      <table className="orderTable blur">
        <thead>
          <tr>
            <th>OrderID</th>
            <th>{view} Address</th>
            <th>Amount <img src={tokenLogo} className="tokenLogoMin" alt="token logo"/></th>
            <th>State</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {content}
        </tbody>
      </table>
      <div id="paginator-buttons">
        {first > 0 && <button role="Previous" className="cta-button basic-button blur" onClick = {() => setFirst(first-20)/*first!=0 -> esiste una pagina precedente*/}>&lt;Prev</button>}
        {first + 20 < orders.length && < button role="Next"className="cta-button basic-button blur" onClick = {() => setFirst(first + 20)/*first+20<orders.length -> esiste una ordine non visualizzato*/}>Next&gt;</button>}     
      </div>
    </div>
  );
}
