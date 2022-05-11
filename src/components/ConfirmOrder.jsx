// NO LONGER NEEDED, not deleting for now


// import { useFetch } from "./useFetch";
// import { ethers } from "ethers";
// import { StateContext } from "./StateContext";
// import { useContext } from "react";
// import { Loading } from "./Loading";
// import { useState } from 'react';
// import avaxLogo from "../assets/avaxLogoMin.png";

// function getOrderId() {
//   const windowUrl = window.location.search;
//   const params = new URLSearchParams(windowUrl);
//   return params.get('order');
// }

// export function ConfirmOrder({ processOrder }) {
//     const  = useContext(StateContext);
//     const [order, isLoaded, error] = useFetch("http://localhost:8000/orders/"+ getOrderId());

//     if (error) {
//       return <h2>Error: {error}</h2>;
//     } else if (!isLoaded) {
//       return <Loading />;
//     } else {
//       return (
//         <>
//           <p className="total-price">Payment amount: &nbsp; {order.price} AVAX<img src={avaxLogo} className="avaxLogoMin" alt="avax logo"/></p>
//             <button onClick={() => {processOrder(context, order.price, order.sellerAddress)}} 
//               className="cta-button basic-button create-transaction" id="createOrder">Create transaction</button>
//         </>
//       );
//     }
// }