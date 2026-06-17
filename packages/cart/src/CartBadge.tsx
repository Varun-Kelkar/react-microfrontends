import React, { useState, useEffect } from 'react';
import Badge from 'uiKit/Badge';
import { EventBus, EVENTS } from '@mfe-demo/shared/eventBus';
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

    EventBus.on(EVENTS.CART_ADD_ITEM, updateCount);
    EventBus.on(EVENTS.CART_REMOVE_ITEM, updateCount);
    EventBus.on(EVENTS.CART_CLEAR, updateCount);
    EventBus.on(EVENTS.CART_UPDATE_QUANTITY, updateCount);

    return () => {
      EventBus.off(EVENTS.CART_ADD_ITEM, updateCount);
      EventBus.off(EVENTS.CART_REMOVE_ITEM, updateCount);
      EventBus.off(EVENTS.CART_CLEAR, updateCount);
      EventBus.off(EVENTS.CART_UPDATE_QUANTITY, updateCount);
    };
  }, []);

  return <Badge count={count} />;
};

export default CartBadge;
