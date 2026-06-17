import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import RemoteErrorBoundary from './components/RemoteErrorBoundary';

const ProductCatalog = lazy(() => import('productCatalog/ProductCatalog'));
const Cart = lazy(() => import('cart/Cart'));
const Checkout = lazy(() => import('checkout/Checkout'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/products"
                element={
                  <RemoteErrorBoundary name="Product Catalog">
                    <ProductCatalog />
                  </RemoteErrorBoundary>
                }
              />
              <Route
                path="/cart"
                element={
                  <RemoteErrorBoundary name="Cart">
                    <Cart />
                  </RemoteErrorBoundary>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RemoteErrorBoundary name="Checkout">
                    <Checkout />
                  </RemoteErrorBoundary>
                }
              />
            </Routes>
          </Suspense>
        </main>
        <footer className="border-t border-secondary-200 dark:border-secondary-700 py-6 text-center text-secondary-400 dark:text-secondary-500 text-sm">
          MFE E-Commerce Demo — Webpack Module Federation
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
