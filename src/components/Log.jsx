import React, { useEffect, useState, useContext }from "react";
import { useLocation } from 'react-router-dom'
import { StateContext } from './StateContext'

export function Log({order}) {

    const context = useContext(StateContext);
    const id = parseInt(order[0]._hex);
    const [content, setContent] = useState();
    let orderState;

    function visualizeOrder(element) {
        switch (element[0]) {
            case 0: orderState = "Created"; break;
            case 1: orderState = "Shipped"; break;
            case 2: orderState = "Confirmed"; break;
            case 3: orderState = "Deleted"; break;
            case 4: orderState = "Refund Asked"; break;
            case 5: orderState = "Refunded"; break;
            default: orderState = "Errore"; break;
        }

        let date = new Date(parseInt(element[1].toString())*1000).toLocaleString();
        let am_or_pm = date.substring(date.length-3, date.length);
        date = date.replace(",", "").substring(0, date.length - 7) + am_or_pm;

        const res =
            <tr key={orderState}>
                <td aria-label="State">{orderState}</td>
                <td aria-label="Timestamp">
                    {date}
                </td>
            </tr>;
        return res;
    }
    
    useEffect(() => {
        // let aux = [];
        context._getLog(id).then((log) => {
            if (log.length) 
                setContent(log.map((element) => (visualizeOrder(element))));
        });
    }, [])

    return (
        <table role="logTable" className="blur logTable">
            <thead>
                <tr>
                    <th>State</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                {content}
            </tbody>
        </table>
    );
}