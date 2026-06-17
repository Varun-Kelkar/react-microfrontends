import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, CreditCard } from 'lucide-react';
import { EventBus, EVENTS } from '@mfe-demo/shared/eventBus';
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
    EventBus.on(EVENTS.CART_ADD_ITEM, handleCartChange);
    EventBus.on(EVENTS.CART_REMOVE_ITEM, handleCartChange);
    EventBus.on(EVENTS.CART_CLEAR, handleCartChange);

    return () => {
      EventBus.off(EVENTS.CART_ADD_ITEM, handleCartChange);
      EventBus.off(EVENTS.CART_REMOVE_ITEM, handleCartChange);
      EventBus.off(EVENTS.CART_CLEAR, handleCartChange);
    };
  }, []);

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/products', label: 'Products', icon: ShoppingBag },
    { path: '/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/checkout', label: 'Checkout', icon: CreditCard },
  ];

  return (
    <header className="bg-white dark:bg-secondary-900 shadow-sm border-b border-secondary-200 dark:border-secondary-700">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary-600">
          MFE Store
        </Link>
        <nav className="flex items-center gap-6">
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
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};

export default Header;
