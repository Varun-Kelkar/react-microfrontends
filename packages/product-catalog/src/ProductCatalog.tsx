import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Card from 'uiKit/Card';
import { EventBus } from '@mfe-demo/shared/eventBus';
import { Product, CartItem } from '@mfe-demo/shared/types';
import { products } from './data/products';
import './styles.css';

const ProductCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const loadCart = () => {
    const stored = localStorage.getItem('mfe-cart');
    setCartItems(stored ? JSON.parse(stored) : []);
  };

  useEffect(() => {
    loadCart();

    const handleCartChange = () => loadCart();
    EventBus.on('cart:add-item', handleCartChange);
    EventBus.on('cart:remove-item', handleCartChange);
    EventBus.on('cart:update-quantity', handleCartChange);
    EventBus.on('cart:clear', handleCartChange);

    return () => {
      EventBus.off('cart:add-item', handleCartChange);
      EventBus.off('cart:remove-item', handleCartChange);
      EventBus.off('cart:update-quantity', handleCartChange);
      EventBus.off('cart:clear', handleCartChange);
    };
  }, []);

  const getCartQuantity = (productId: string): number => {
    const item = cartItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: Product) => {
    const stored = localStorage.getItem('mfe-cart');
    const items: CartItem[] = stored ? JSON.parse(stored) : [];
    const existing = items.find((item) => item.product.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ product, quantity: 1 });
    }
    localStorage.setItem('mfe-cart', JSON.stringify(items));
    setCartItems(items);

    EventBus.emit('cart:add-item', { product, quantity: 1 });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const stored = localStorage.getItem('mfe-cart');
    const items: CartItem[] = stored ? JSON.parse(stored) : [];
    const updated = items
      .map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);

    localStorage.setItem('mfe-cart', JSON.stringify(updated));
    setCartItems(updated);

    if (updated.find((item) => item.product.id === productId)) {
      EventBus.emit('cart:update-quantity', { productId, delta });
    } else {
      EventBus.emit('cart:remove-item', { productId });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">Products</h1>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          const quantity = getCartQuantity(product.id);

          return (
            <Card
              key={product.id}
              title={product.name}
              image={product.image}
              imageAlt={product.name}
              footer={
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-secondary-900 dark:text-secondary-100 shrink-0">
                    ${product.price.toFixed(2)}
                  </span>
                  {quantity === 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1.5 text-sm font-medium rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                    >
                      <span className="hidden sm:inline">Add to Cart</span>
                      <ShoppingCart className="w-4 h-4 sm:hidden" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateQuantity(product.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-sm font-medium"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium text-secondary-900 dark:text-secondary-100 text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(product.id, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 text-sm font-medium"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => navigate('/cart')}
                        className="px-2 py-1.5 text-sm font-medium rounded bg-secondary-200 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-300 dark:hover:bg-secondary-500 transition-colors"
                        title="Go to Cart"
                      >
                        <span className="hidden sm:inline">Go to Cart</span>
                        <ShoppingCart className="w-4 h-4 sm:hidden" />
                      </button>
                    </div>
                  )}
                </div>
              }
            >
              <p className="text-sm">{product.description}</p>
              <span className="inline-block mt-2 text-xs bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400 px-2 py-0.5 rounded">
                {product.category}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProductCatalog;
