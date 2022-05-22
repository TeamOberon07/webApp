import React, { useEffect, useState, useContext }from "react";
import { StateContext } from './StateContext'

export function Log({order}) {
    //componente che renderizza la visualizzazione dei log di un ordine

    const context = useContext(StateContext);
    const id = parseInt(order[0]._hex);
    const [content, setContent] = useState();
    let orderState;

    function visualizeLog(element) {
        //conversione dello stato dell'ordine da intero a stringa
        orderState = context.orderState[element[0]];

        let date = new Date(parseInt(element[1].toString())*1000).toLocaleString();
        let am_or_pm = date.substring(date.length-3, date.length);
        date = date.replace(",", "").substring(0, date.length - 7) + am_or_pm;

        // let txhash = "0xahsid998u20d2j802jh80"

        const res =
            <tr key={orderState}>
                <td aria-label="State">{orderState}</td>
                <td aria-label="Timestamp">{date}</td>
                {/* <td aria-label="Txhash">{txhash}</td> */}
            </tr>;
        return res;
    }
    
    //chiamata alla funzione dello smart contract che recupera i log dell'ordine indicato quando esso è pronto
    useEffect(() => {
        context._getLog(id).then((log) => {
            if (log.length) 
                setContent(log.map((element) => (visualizeLog(element))));
        });
    }, [context._contract])

    return (
        <table role="logTable" className="blur logTable">
            <thead>
                <tr>
                    <th>State</th>
                    <th>Timestamp</th>
                    {/* <th>Tx Hash</th> */}
                </tr>
            </thead>
            <tbody>{content}</tbody>
        </table>
    );
}