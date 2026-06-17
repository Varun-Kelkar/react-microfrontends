import React from 'react';
import ReactDOM from 'react-dom/client';
import Checkout from './Checkout';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <div className="max-w-2xl mx-auto px-4 py-8">
    <Checkout />
  </div>
);
