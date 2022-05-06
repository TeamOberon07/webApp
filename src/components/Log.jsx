import React from "react";
import { useState, useContext } from 'react';
import {StateContext} from './StateContext'

export function Log({content}) {
    // console.log(JSON.stringify(method)  + " " + id + " " +  text  + " " +  amount )
    return (
      <table className="blur logTable">
        <thead>
          <tr>
            <th>State</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {content}
          <tr>
            <td>State</td>
            <td>Timestamp</td>
          </tr><tr>
            <td>State</td>
            <td>Timestamp</td>
          </tr>
          <tr>
            <td>State</td>
            <td>Timestamp</td>
          </tr>

        </tbody>
      </table>
    );
}