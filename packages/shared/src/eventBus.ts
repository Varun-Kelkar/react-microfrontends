type EventHandler = (event: CustomEvent) => void;

const listeners = new Map<string, Set<EventHandler>>();

export const EventBus = {
  emit<T = unknown>(eventName: string, payload?: T): void {
    const event = new CustomEvent(eventName, { detail: payload });
    window.dispatchEvent(event);
  },

  on(eventName: string, handler: EventHandler): void {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }
    listeners.get(eventName)!.add(handler);
    window.addEventListener(eventName, handler as EventListener);
  },

  off(eventName: string, handler: EventHandler): void {
    window.removeEventListener(eventName, handler as EventListener);
    listeners.get(eventName)?.delete(handler);
  },

  offAll(eventName: string): void {
    const handlers = listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => {
        window.removeEventListener(eventName, handler as EventListener);
      });
      listeners.delete(eventName);
    }
  },
};

// Event name constants
export const EVENTS = {
  CART_ADD_ITEM: 'cart:add-item',
  CART_REMOVE_ITEM: 'cart:remove-item',
  CART_UPDATE_QUANTITY: 'cart:update-quantity',
  CART_CLEAR: 'cart:clear',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
} as const;
