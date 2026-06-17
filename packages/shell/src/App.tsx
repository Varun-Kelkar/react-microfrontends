import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import HealthCheck from './components/HealthCheck';
import RemoteErrorBoundary from './components/RemoteErrorBoundary';
import { retryLazy } from './utils/retryLazy';

const { Component: ProductCatalog, retry: retryProductCatalog } = retryLazy(
  () => import('productCatalog/ProductCatalog')
);
const { Component: Cart, retry: retryCart } = retryLazy(
  () => import('cart/Cart')
);
const { Component: Checkout, retry: retryCheckout } = retryLazy(
  () => import('checkout/Checkout')
);

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
                  <RemoteErrorBoundary name="Product Catalog" onRetry={retryProductCatalog}>
                    <ProductCatalog />
                  </RemoteErrorBoundary>
                }
              />
              <Route
                path="/cart"
                element={
                  <RemoteErrorBoundary name="Cart" onRetry={retryCart}>
                    <Cart />
                  </RemoteErrorBoundary>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RemoteErrorBoundary name="Checkout" onRetry={retryCheckout}>
                    <Checkout />
                  </RemoteErrorBoundary>
                }
              />
              <Route path="/health-check" element={<HealthCheck />} />
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
