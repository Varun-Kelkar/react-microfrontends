import React, { useState } from 'react';
import Button from 'uiKit/Button';
import Card from 'uiKit/Card';
import { EventBus, EVENTS } from '@mfe-demo/shared/eventBus';
import { Product } from '@mfe-demo/shared/types';
import { products } from './data/products';
import './styles.css';

const ProductCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...new Set(products.map((p) => p.category))];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    // Update localStorage
    const stored = localStorage.getItem('mfe-cart');
    const cartItems = stored ? JSON.parse(stored) : [];
    const existing = cartItems.find(
      (item: { product: Product }) => item.product.id === product.id
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({ product, quantity: 1 });
    }
    localStorage.setItem('mfe-cart', JSON.stringify(cartItems));

    // Emit event for cross-MFE communication
    EventBus.emit(EVENTS.CART_ADD_ITEM, { product, quantity: 1 });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">Products</h1>

      {/* Category filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              selectedCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            title={product.name}
            image={product.image}
            imageAlt={product.name}
            footer={
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-secondary-900">
                  ${product.price.toFixed(2)}
                </span>
                <Button size="sm" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </Button>
              </div>
            }
          >
            <p className="text-sm">{product.description}</p>
            <span className="inline-block mt-2 text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded">
              {product.category}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductCatalog;
