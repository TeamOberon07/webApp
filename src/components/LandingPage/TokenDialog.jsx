import { useState } from "react";
import tokenLogo from "../../assets/usdcLogoMin.png";
import avaxLogo from "../../assets/avaxLogo.png";
import { Loading } from '../Loading';
import TOKENS from "./tokenlist.js";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

export function TokenDialog(props) {

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
      "logoURI": avaxLogo
  }

    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle className="dialogTitle">Chose a token for the payment:</DialogTitle>
        <ul className="ul-tokens">
            <li onClick={() => handleListItemClick(AVAX)} key={AVAX.name} className="li-tokens">
              <span>
                <img href={AVAX.logoURI} className="tokenLogoMin li-img-token"/>
                {AVAX.symbol}
              </span>
              <span>
                9.99
              </span>
            </li>
          {TOKENS.map((token) => (
            // <ListItem button onClick={() => handleListItemClick(token)} key={token}>
            //   {/* <img></img> */}
            //   <ListItemText primary={token} />
            // </ListItem>
            <li onClick={() => handleListItemClick(token)} key={token.name} className="li-tokens">
              <span>
                <img href={token.logoURI} className="tokenLogoMin li-img-token"/>
                {token.symbol}
              </span>
              <span>
                9.99
              </span>
            </li>
          ))}
        </ul>
      </Dialog>
    );
}