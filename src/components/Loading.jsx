import React from "react";

export function Loading({ text }) {
    //componente react da presentare nei momenti di caricamento della webApp
    return (
        <div className="box">
            <div className="spinner">
                <span>{text ? text : 'Loading...'}</span>
                <div className="half-spinner"></div>
            </div>
        </div>
    );
}