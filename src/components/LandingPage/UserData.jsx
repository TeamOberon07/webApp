import { useContext } from "react";
import {StateContext} from "../StateContext";
import avaxLogo from "../../assets/avaxLogoMin.png";

export function UserData() {
    const context = useContext(StateContext);

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