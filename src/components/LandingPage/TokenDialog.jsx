import { useState } from "react";
import tokenLogo from "../../assets/usdcLogoMin.png";
import { Loading } from '../Loading';
import TOKENS from "./tokenlist.js";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

export function TokenDialog(props) {

    console.log(TOKENS);

    const { onClose, selectedValue, open } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };

    const handleListItemClick = (value) => {
        onClose(value);
    };

    return (
        <Dialog onClose={handleClose} open={open}>
          <DialogTitle>Chose token for the payment</DialogTitle>
          <List sx={{ pt: 0 }}>
            {TOKENS.map((token) => (
              <ListItem button onClick={() => handleListItemClick(token)} key={token}>
                {/* <img></img> */}
                <ListItemText primary={token} />
              </ListItem>
            ))}
          </List>
        </Dialog>
    );
}