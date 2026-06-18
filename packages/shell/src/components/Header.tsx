import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, CreditCard, Activity, LogIn, ChevronDown } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { EventBus } from '@mfe-demo/shared/eventBus';
import type { CartItem } from '@mfe-demo/shared/types';
import ThemeToggle from './ThemeToggle';

const UserMenu = lazy(() => import('auth/UserMenu'));

const Header: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const updateCartCount = () => {
      const stored = localStorage.getItem('mfe-cart');
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setCartCount(0);
      }
    };

    // Initial load
    updateCartCount();

    // Listen for cart events
    const handleCartChange = () => updateCartCount();
    EventBus.on('cart:add-item', handleCartChange);
    EventBus.on('cart:remove-item', handleCartChange);
    EventBus.on('cart:clear', handleCartChange);
    EventBus.on('cart:update-quantity', handleCartChange);

    return () => {
      EventBus.off('cart:add-item', handleCartChange);
      EventBus.off('cart:remove-item', handleCartChange);
      EventBus.off('cart:clear', handleCartChange);
      EventBus.off('cart:update-quantity', handleCartChange);
    };
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/products', label: 'Products', icon: ShoppingBag },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/checkout', label: 'Checkout', icon: CreditCard },
    { path: '/health-check', label: 'Health', icon: Activity },
  ];

  return (
    <header className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-700 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link to="/" className="text-xl font-bold text-primary-600 shrink-0">
          MFE Store
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
                {link.path === '/cart' && cartCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white rounded-full bg-danger-500">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile/tablet nav dropdown + actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative md:hidden">
            <select
              value={location.pathname}
              onChange={(e) => navigate(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm font-medium rounded border border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {navLinks.map((link) => (
                <option key={link.path} value={link.path}>
                  {link.label}{link.path === '/cart' && cartCount > 0 ? ` (${cartCount})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-secondary-500 pointer-events-none" />
          </div>

          {/* Cart badge visible on mobile (quick access outside dropdown) */}
          <Link
            to="/cart"
            className="relative md:hidden text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[1rem] h-4 px-1 text-[10px] font-bold text-white rounded-full bg-danger-500">
                {cartCount}
              </span>
            )}
          </Link>

          <ThemeToggle />
          {isSignedIn ? (
            <Suspense fallback={<div className="w-8 h-8 rounded-full bg-secondary-200 dark:bg-secondary-700 animate-pulse" />}>
              <UserMenu />
            </Suspense>
          ) : (
            <Link
              to="/sign-in"
              className="flex items-center gap-1.5 text-sm font-medium text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
