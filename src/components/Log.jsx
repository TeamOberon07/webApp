import React from "react";
import { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom'
import {useEffect} from 'react';
import { StateContext } from './StateContext'

export function Log() {

    const context = useContext(StateContext);
    const order = useLocation().state.order;
    const id = parseInt(order[0]._hex);
    let orderState, content, log;

    function visualizeOrder(element) {

        switch (element[0]) {
            case 0: orderState = "Created"; break;
            case 1: orderState = "Shipped"; break;
            case 2: orderState = "Confirmed"; break;
            case 3: orderState = "Deleted"; break;
            case 4: orderState = "RefundAsked"; break;
            case 5: orderState = "Refunded"; break;
        }

        const res =
            <tr key={orderState}>
                <td aria-label="State">{orderState}</td>
                <td aria-label="Timestamp">
                    {element[1].toString()}
                </td>
            </tr>;
        return res;
    }

    useEffect(() => {
        console.log("id"+id);
        context._getLog(id).then((log) => {
            if (log.length) 
                content = log.map((element) => (visualizeOrder(element)));
        });
    })

    return (
        <table className="blur logTable">
            <thead>
                <tr>
                    <th>State</th>
                    <th>Timestamp</th>
                </tr>
            </thead>

            <tbody>

                <tr>
                    <td>State</td>
                    <td>Timestamp</td>
                </tr>

                <tr>
                    <td>State</td>
                    <td>Timestamp</td>
                </tr>

                {content}
            </tbody>
        </table>
    );
}