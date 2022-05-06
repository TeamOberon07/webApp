import React from "react";
import { useState, useContext } from 'react';
import { StateContext } from './StateContext'

export function Log({log}) {

    let content;

    function visualizeOrder(element) {
        const res = 
        <tr key={element[0].toString()}>
            <td aria-label="State">{element[0].toString()}</td>
            <td aria-label="Timestamp">
                {element[1].toString()}
            </td>
        </tr>;
        return res;
    }

    // if (log.length) {
    //     content = log.map((element) => (visualizeOrder(element)));
    // }


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
                {content}
            </tbody>
        </table>
    );
}