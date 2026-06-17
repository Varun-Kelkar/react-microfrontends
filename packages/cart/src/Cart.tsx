import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'uiKit/Button';
import Modal from 'uiKit/Modal';
import { EventBus } from '@mfe-demo/shared/eventBus';
import { CartItem } from '@mfe-demo/shared/types';
import './styles.css';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const loadCart = () => {
    const stored = localStorage.getItem('mfe-cart');
    setItems(stored ? JSON.parse(stored) : []);
  };

  useEffect(() => {
    loadCart();

    const handleCartChange = () => loadCart();
    EventBus.on('cart:add-item', handleCartChange);

    return () => {
      EventBus.off('cart:add-item', handleCartChange);
    };
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    const updated = items
      .map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);

    setItems(updated);
    localStorage.setItem('mfe-cart', JSON.stringify(updated));
    EventBus.emit('cart:update-quantity', { productId, delta });
  };

  const removeItem = (productId: string) => {
    const updated = items.filter((item) => item.product.id !== productId);
    setItems(updated);
    localStorage.setItem('mfe-cart', JSON.stringify(updated));
    EventBus.emit('cart:remove-item', { productId });
    setRemoveTarget(null);
  };

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-secondary-500 dark:text-secondary-400 text-lg">Your cart is empty.</p>
        <p className="text-secondary-400 dark:text-secondary-500 text-sm mt-2">
          Browse products and add items to your cart.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100 mb-6">
        Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
      </h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-4 bg-white dark:bg-secondary-800 p-4 rounded shadow-sm border border-secondary-200 dark:border-secondary-700"
          >
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                {item.product.name}
              </h3>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">
                ${item.product.price.toFixed(2)} each
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.id, -1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.product.id, 1)}
                className="w-8 h-8 flex items-center justify-center rounded bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600"
              >
                +
              </button>
            </div>
            <p className="font-bold text-secondary-900 dark:text-secondary-100 w-24 text-right">
              ${(item.product.price * item.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => setRemoveTarget(item.product.id)}
              className="text-danger-500 hover:text-danger-600 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between bg-white dark:bg-secondary-800 p-4 rounded shadow-sm border border-secondary-200 dark:border-secondary-700">
        <span className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">Total:</span>
        <span className="text-2xl font-bold text-primary-600">
          ${total.toFixed(2)}
        </span>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={() => navigate('/checkout')}>
          Proceed to Checkout
        </Button>
      </div>

      {/* Remove confirmation modal */}
      <Modal
        isOpen={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="Remove Item"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => removeTarget && removeItem(removeTarget)}
            >
              Remove
            </Button>
          </>
        }
      >
        <p className="text-secondary-600 dark:text-secondary-300">
          Are you sure you want to remove this item from your cart?
        </p>
      </Modal>
    </div>
  );
};

export default Cart;
