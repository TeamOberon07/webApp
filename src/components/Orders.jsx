import React from "react";
import { ethers } from "ethers";
import avaxLogo from "../assets/avaxLogoMin.png";
import { useState } from 'react';
import { NavLink } from "react-router-dom";

export function Orders({orders, isBuyer, State}) {

  let content, view, i, amount, totalHeldForSeller=0, n=6;
  const [first, setFirst] = useState(0);

  if (isBuyer) {
    i = 2;
    view = "Seller";
  } else {
    i = 1;
    view = "Buyer"
  }
  // style foreach different state
  const Icon = ['check_circle', 'verified', 'delete', 'assignment_return', 'reply'];
  const Color = [
    {color: 'rgb(105 235 115)'}, // green 
    {color: 'rgb(77 165 255)'}, // blue
    {color: 'rgb(227 85 86)'}, // red
    {color: 'rgb(242 245 70)'}, // yellow
    {color: 'white'}
  ];

  if (orders.length) {
    content = orders.slice(first, first+20).map((element) => (
        <tr key={element[0].toString()}>
          <td>{element[0].toString()}</td>
          <td>
            {
              element[i].toString().substring(0,n)
              +"..."+
              element[i].toString().substring(
                element[i].toString().length-n,
                element[i].toString().length
              )
            }
          </td>
          {(() => {
            amount = ethers.utils.formatEther(element[3].toString());
          })()}
          <td>{amount}</td>
          <td>
            {State[element[4]]}
            <span className="material-icons" style={Color[element[4]]}>{Icon[element[4]]}</span>
          </td>
          <td className = "order-button-cell">
            <NavLink 
            to="/order-page"
            state={{ id: element[0].toString(),
                     amount: amount,
                     orderState: State[element[4]]}}
            className = "order-button">See order</NavLink>
          </td>
          {(() => {
            if(State[element[4]] === "Created") {
              totalHeldForSeller += parseFloat(amount)
            }
          })()}

        </tr>
    ))
  }

  return (
    <div className="box">
        <div className="tableLabel">
          <h2>Order List</h2>
          <p className="TVL">Your TVL: {totalHeldForSeller.toFixed(4)}<img src={avaxLogo} className="avaxLogoMin" alt="avax logo"/></p>
        </div>
      <table className="orderTable blur">
        <thead>
          <tr>
            <th>OrderID</th>
            <th>{view} Address</th>
            <th>Amount <img src={avaxLogo} className="avaxLogoMin" alt="avax logo"/></th>
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
