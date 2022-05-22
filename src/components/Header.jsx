import React, { useContext } from "react";
import { StateContext } from "./StateContext";
import { NavLink } from "react-router-dom";
import avaxLogo from "../assets/avaxLogo.png";
import shopChainLogo from "../assets/logoShopChain.png";

export function Header() {
  const context = useContext(StateContext);

  //address connesso via MetaMask
  let currentAddress = context.currentAddress;

  //address di deploy dello smart contract
  let contractAddress = context.contractAddress;

  //bilancio dell'utente loggato
  let balance = context.balance;

  let blockExplorerLink = context.networks[context.ourNetwork].blockExplorerUrls[0];

  //rappresentazione più semplice degli address esadecimali
  let currentAddressCut = context._cutAddress(currentAddress);
  let contractAddressCut = context._cutAddress(contractAddress);

  return (
    <header>
      <div className="navigation">
        <nav className="navbar navbar-expand navbar-dark blur">
            <img id="imgLogo" src={shopChainLogo} alt="Logo ShopChain"/>
            <NavLink className="navbar-brand" to="/">ShopChain</NavLink>
            <div className="user-data nav-item">
              <ul>
                <li>
                  <span>Smart Contract:</span> 
                  <span><a href={blockExplorerLink+"/address/"+contractAddress} target="_blank">{contractAddressCut}</a></span>
                </li>
                <li>
                  <span>Your Address:</span> 
                  <span><a href={blockExplorerLink+"/address/"+currentAddress} target="_blank">{currentAddressCut}</a></span>
                </li>
                <li>
                  <span>Your Balance:</span> 
                  <span>{parseFloat(balance).toFixed(4)}<img src={avaxLogo} className="tokenLogoMin" alt="avax logo"/></span>
                </li>
              </ul>
            </div>
        </nav>
      </div>
    </header>
  );
}