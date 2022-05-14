import { useContext } from "react";
import avaxLogo from "../../assets/avaxLogo.png";
import TOKENS from "./tokenlist.js";
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { StateContext } from "../StateContext";

export function TokenDialog(props) {

    const context = useContext(StateContext);
    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };

    const AVAX = {
      "address": "NULL",
      "name": "AVAX",
      "symbol": "AVAX",
      "logoURI": avaxLogo,
      "balance": parseFloat(context.balance).toFixed(4)
    }

    TOKENS.map(async (token) => {
      let balance = await context._getERC20Balance(token.address);
      balance = parseFloat(balance).toFixed(4);
      balance = parseFloat(balance);
      token.balance = balance;
    })

    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle className="dialogTitle">Choose a token for the payment:</DialogTitle>
        <p id="dialog-legend">
          <span>Token:</span>
          <span>Balance:</span>
        </p>
        <ul className="ul-tokens">
            <li onClick={() => handleListItemClick(AVAX)} key={AVAX.name} className="li-tokens">
              <span>
                <img src={AVAX.logoURI} className="tokenLogoMin li-img-token" alt="Logo AVAX"/>
                {AVAX.symbol}
              </span>
              <span>
                {AVAX.balance}
              </span>
            </li>
          {TOKENS.map((token) => (
            <li onClick={() => handleListItemClick(token)} key={token.name} className="li-tokens">
              <span>
                <img src={token.logoURI} className="tokenLogoMin li-img-token" alt="Logo token"/>
                {token.symbol}
              </span>
              <span>
                {token.balance}
              </span>
            </li>
          ))}
        </ul>
      </Dialog>
    );
}