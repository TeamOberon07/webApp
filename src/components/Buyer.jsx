import React from "react";
import { Header } from './Header';
import { Orders } from "./Orders";

export function Buyer({currentAddress, balance, orders, askRefund, State}) {
  let options = "";
  return (
    <div>
      <Header currentAddress={currentAddress}
              balance={balance}
      />
      <div className="container">
        <div className="content-and-qrcode">
          <div className="box top">
            <h2>Buyer view</h2>
            <form onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                const id = formData.get("orderIDs");
                if(id)
                  askRefund(id);
              }}>
              <div className="button-label-select">
                <input className="cta-button basic-button blur" type="submit" value="Ask refund" />
                <label className="label-selectBox">Order to ask for refund:</label>
                <select id="orderIDs" name="orderIDs" className="blur">
                  {(() => {
                    if (orders.length) {
                      options = orders.map((element) => (
                        (() => {
                          if (State[element[4]] === "Created" || State[element[4]] === "Confirmed") {
                            return <option key={element[0].toString()} value={element[0].toString()}>{element[0].toString()}</option>
                          }
                        })()
                      ))
                    }
                  })()}
                  {options}
                </select>
              </div>
            </form>
          </div>
        </div>

        <Orders orders={orders} isBuyer={true} State={State}/>
      </div>
    </div>
  );
}