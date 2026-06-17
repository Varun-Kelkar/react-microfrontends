import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, CreditCard, Activity } from 'lucide-react';
import { EventBus } from '@mfe-demo/shared/eventBus';
import type { CartItem } from '@mfe-demo/shared/types';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

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

    return () => {
      EventBus.off('cart:add-item', handleCartChange);
      EventBus.off('cart:remove-item', handleCartChange);
      EventBus.off('cart:clear', handleCartChange);
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
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="text-xl font-bold text-primary-600 shrink-0">
          MFE Store
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 md:gap-6 flex-wrap">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600'
                    : 'text-secondary-600 dark:text-secondary-400 hover:text-primary-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{link.label}</span>
                {link.path === '/cart' && cartCount > 0 && (
                  <span className="ml-0.5 sm:ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold text-white rounded-full bg-danger-500">
                    {cartCount}
                  </span>
                )}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
