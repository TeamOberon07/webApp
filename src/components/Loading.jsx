import React from "react";

export function Loading({ text }) {
    return (
        <div className="box">
            <div className="spinner">
                <span>{text ? text : 'Loading...'}</span>
                <div className="half-spinner"></div>
            </div>
        </div>
    );
}