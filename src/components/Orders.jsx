import React from "react";
import { ethers } from "ethers";
import tokenLogo from "../assets/usdtLogo.png";
import { useState, useEffect } from 'react';
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
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [errorFilter, setErrorFilter] = useState("");

  useEffect(() => {
    
  }, [filteredOrders]);


  if (isBuyer) {
    userIndex = 2;
    view = "Seller";
  } else {
    userIndex = 1;
    view = "Buyer"
  }

  function applyFilters(e){
    e.preventDefault();
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
    setFilteredOrders(res);
    return res;
  }

  function filterOrdersByState(ordersToFilter, state) {
    let res = [];
    ordersToFilter.forEach(element => {
      if (state === -1 || element[4] === state) {
        res.push(element);
      }
    });
    setFilteredOrders(res);
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
  
  function visualizeOrder(order) {
    const res = <tr key={order[0].toString()}>
            <td aria-label="Id">{order[0].toString()}</td>
            <td aria-label="Address">
              <span data-testid="copyIcon"
                id={ "copyIcon" + order[0].toString() }
                onClick={ () => copyAddress(order[userIndex].toString(), "copyIcon" + order[0].toString()) } 
                className="material-icons copy"
              >
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
              <NavLink 
              to="/order-page"
              state={{ orderState: State[order[4]],
                       order: order}}
              className = "cta-button order-button blur-light">See order</NavLink>   
            </td>
            {(() => {
              if(State[order[4]] === "Created") {
                totalHeldForSeller += parseFloat(amount)
              }
            })()}
          </tr>;
    return res;
  }

  if (filteredOrders.length !== 0) {
    content = filteredOrders.slice(first, first+20).map((element) => (visualizeOrder(element)));
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
                <option value="4" key="4">Refund Asked</option>
                <option value="5" key="5">Refunded</option>
              </select>
            </div>
          </div>
        </div>
        <div id="filterButtons">
          <button role="ApplyFilters" className="cta-button basic-button blur" onClick = {(e) => applyFilters(e)}><span className="material-icons">filter_alt</span></button>
          <button role="ResetFilters" className="cta-button basic-button blur" onClick = {() => setFilteredOrders([])}><span className="material-icons">filter_alt_off</span></button>
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
        {first > 0 && <button role="Previous" className="cta-button basic-button blur" onClick = {() => setFirst(first-20)}>&lt;Prev</button>}
        {first + 20 < orders.length && < button role="Next"className="cta-button basic-button blur" onClick = {() => setFirst(first + 20)}>Next&gt;</button>}     
      </div>
    </div>
  );
}
