import React from "react";
import { ethers } from "ethers";
import tokenLogo from "../assets/usdtLogo.png";
import { useState } from 'react';
import { NavLink } from "react-router-dom";

export function Orders({orders, isBuyer, State}) {

  let content, view, userIndex, amount, totalHeldForSeller=0;
  // style foreach different state
  const Icon = ['check_circle', 'local_shipping', 'verified', 'delete', 'assignment_return', 'reply'];
  const Color = [
    { color: 'rgb(105 235 115)' }, // green 
    { color: 'rgb(255 255 255)' },
    { color: 'rgb(77 165 255)' }, // blue
    { color: 'rgb(227 85 86)' }, // red
    { color: 'rgb(242 245 70)' }, // yellow
    { color: 'white' }
  ];
  const [first, setFirst] = useState(0);
  const [filtered_orders, setFiltered_orders] = useState([]);
  const [errorFilter, setErrorFilter] = useState("");

  if (isBuyer) {
    userIndex = 2;
    view = "Seller";
  } else {
    userIndex = 1;
    view = "Buyer"
  }

  function applyFilters(){
    var state = parseInt(document.getElementById("FilterState").value);
    if(errorFilter !== "Inserted address is not valid" && document.getElementById("FilterAddress").value !== ""){
      var res = filterOrdersByAddress(document.getElementById("FilterAddress").value);
      if(res.length !== 0){
        filterOrdersByState(res, state);
      }
    }
    else
      filterOrdersByState(orders, state);
  }
  
  function filterOrdersByAddress(address) {
    let res = [];
    orders.forEach(element => {
      if (element[1].toString() === address || element[2].toString() === address) {
        res.push(element);
      }
    });
    setFiltered_orders(res);
    return res;
  }

  function filterOrdersByState(ordersToFilter, state) {
    let res = [];
    ordersToFilter.forEach(element => {
      if (state === -1 || element[4] === state) {
        res.push(element);
      }
    });
    setFiltered_orders(res);
    if(res.length === 0)
      setErrorFilter("No order found for specified filters");
    else
      setErrorFilter("");
  }

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
  
  function visualizeOrder(element) {
    const res = <tr key={element[0].toString()}>
            <td aria-label="Id">{element[0].toString()}</td>
            <td aria-label="Address">
              <span
                id={ "copyIcon" + element[0].toString() }
                onClick={ () => copyAddress(element[userIndex].toString(), "copyIcon" + element[0].toString()) } 
                className="material-icons copy"
              >
                file_copy
              </span>
              {
                element[userIndex].toString().substring(0,6)
                +"..."+
                element[userIndex].toString().substring(
                  element[userIndex].toString().length-6,
                  element[userIndex].toString().length
                )
              }
            </td>
            {(() => {
              amount = ethers.utils.formatEther(element[3].toString());
            })()}
            <td aria-label="Amount">${amount}</td>
            <td aria-label="Icon">
              {State[element[4]]}
              <span className="material-icons" style={Color[element[4]]}>{Icon[element[4]]}</span>
            </td>
            <td className = "order-button-cell">
              <NavLink 
              to="/order-page"
              state={{ orderState: State[element[4]],
                       order: element}}
              className = "cta-button order-button blur-light">See order</NavLink>   
            </td>
            {(() => {
              if(State[element[4]] === "Created") {
                totalHeldForSeller += parseFloat(amount)
              }
            })()}
          </tr>;
    return res;
  }

  if (filtered_orders.length !== 0) {
    content = filtered_orders.slice(first, first+20).map((element) => (visualizeOrder(element)));
  }
  else if (orders.length) {
    content = orders.slice(first, first+20).map((element) => (visualizeOrder(element)));
  }

  return (
    <div className="box">
      <h1 className="page-title">Your Orders</h1>
      <form id="filters">
        <div id="filters-and-labels">
          <div className="button-label-select">
            <label className="FilterLabel" id="FilterAddressLabel">Address:</label>
            <div id="buyerAddressFilter">
              <input type="text" name="FilterAddress" id="FilterAddress" onBlur={() => {
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
              <select name="FilterState" id="FilterState">
                <option value="-1" key="-1">Any</option>
                <option value="0" key="0">Created</option>
                <option value="1" key="1">Confirmed</option>
                <option value="2" key="2">Deleted</option>
                <option value="3" key="3">Refund Asked</option>
                <option value="4" key="4">Refunded</option>
              </select>
            </div>
          </div>
        </div>
        <div id="filterButtons">
          <button className="cta-button basic-button blur" onClick = {() => applyFilters()}>Apply Filters</button>
          <button className="cta-button basic-button blur" onClick = {() => setFiltered_orders([])}>Reset Filters</button>
        </div>
      </form> 
      <p className="errorP">{errorFilter}</p>
      <div className="tableLabel">
        <p className="TVL">Your TVL: ${parseFloat(totalHeldForSeller.toFixed(4))}<img src={tokenLogo} className="tokenLogoMin" alt="token logo"/></p>
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
        {first > 0 && <button className="cta-button basic-button blur" onClick = {() => setFirst(first-20)}>&lt;Prev</button>}
        {first + 20 < orders.length && < button className="cta-button basic-button blur" onClick = {() => setFirst(first + 20)}>Next&gt;</button>}     
      </div>
    </div>
  );
}
