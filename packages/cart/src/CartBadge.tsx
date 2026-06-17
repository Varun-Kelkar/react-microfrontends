import React, { useState, useEffect } from 'react';
import Badge from 'uiKit/Badge';
import { EventBus } from '@mfe-demo/shared/eventBus';
import { CartItem } from '@mfe-demo/shared/types';

const CartBadge: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const stored = localStorage.getItem('mfe-cart');
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        setCount(items.reduce((sum, item) => sum + item.quantity, 0));
      } else {
        setCount(0);
      }
    };

    updateCount();

    EventBus.on('cart:add-item', updateCount);
    EventBus.on('cart:remove-item', updateCount);
    EventBus.on('cart:clear', updateCount);
    EventBus.on('cart:update-quantity', updateCount);

    return () => {
      EventBus.off('cart:add-item', updateCount);
      EventBus.off('cart:remove-item', updateCount);
      EventBus.off('cart:clear', updateCount);
      EventBus.off('cart:update-quantity', updateCount);
    };
  }, []);

  return <Badge count={count} />;
};

export default CartBadge;
