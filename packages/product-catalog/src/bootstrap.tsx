import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import ProductCatalog from './ProductCatalog';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <div className="max-w-7xl mx-auto px-4 py-8">
    <ProductCatalog />
  </div>
);
