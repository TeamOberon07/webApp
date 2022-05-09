import React from "react";
import { NavLink } from "react-router-dom";
import avaxLogo from "../assets/avaxLogo.png";
import shopChainLogo from "../assets/logoShopChain.png";

export function Header({currentAddress, balance}) {
  currentAddress = String(currentAddress)
  let address = currentAddress.substring(0,6)+ "..." +currentAddress.substring(currentAddress.length-6, currentAddress.length);

  return (
    <header>
      <div className="navigation">
        <nav className="navbar navbar-expand navbar-dark blur">
            <img id="imgLogo" src={shopChainLogo} alt="Logo ShopChain"/>
            <NavLink className="navbar-brand" to="/">
              ShopChain
            </NavLink>
            <div className="user-data nav-item">
              <p>Address: &nbsp; <abbr title = {currentAddress}>{address}</abbr></p>
              <p>Balance: &nbsp; {parseFloat(balance).toFixed(4)}<img src={avaxLogo} className="tokenLogoMin" alt="avax logo"/></p>
            </div>
        </nav>
      </div>
    </header>
  );
}