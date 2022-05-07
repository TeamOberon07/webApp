import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import { DApp } from './components/DApp';
import { RegisterSeller } from './components/RegisterSeller';
import { StateProvider } from './components/StateContext';
import { OrderPage } from './components/OrderPage';
import { LandingPage } from './components/LandingPage/LandingPage';

ReactDOM.render(
  <StateProvider>
    <Router>
      <Routes>
        <Route path="/" exact element={<DApp />} />
        <Route path="/register-seller" element={<RegisterSeller />} />
        <Route path="/order-page" element={<OrderPage />} />
        <Route path="/landing-page" element={<LandingPage />} />
      </Routes>
    </Router>
  </StateProvider>,
  document.getElementById('root')
);