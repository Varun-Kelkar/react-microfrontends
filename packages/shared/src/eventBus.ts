import { EventPayloadMap, EventName } from './eventContracts';

declare const __DEV__: boolean;

type EventHandler<K extends EventName = EventName> = (
  event: CustomEvent<EventPayloadMap[K]>
) => void;

const listeners = new Map<string, Set<EventHandler<any>>>();

// Store debug flag on window so all MFE instances share it
const WIN = window as any;

let schemas: typeof import('./eventSchemas').eventSchemas | null = null;

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  import('./eventSchemas').then((m) => {
    schemas = m.eventSchemas;
  });
}

export const EventBus = {
  enableDebug(): void {
    WIN.__EVENTBUS_DEBUG__ = true;
  },

  disableDebug(): void {
    WIN.__EVENTBUS_DEBUG__ = false;
  },

  emit<K extends EventName>(eventName: K, payload: EventPayloadMap[K]): void {
    if (schemas) {
      const schema = schemas[eventName];
      if (schema) {
        const result = (schema as any).safeParse(payload);
        if (!result.success) {
          if (typeof __DEV__ !== 'undefined' && __DEV__) {
            throw new Error(
              `[EventBus] Invalid payload for "${eventName}":\n${result.error.message}`
            );
          } else {
            console.warn(
              `[EventBus] Payload mismatch for "${eventName}"`,
              result.error.issues
            );
          }
        }
      }
    }

    if (WIN.__EVENTBUS_DEBUG__) {
      console.log(
        `%c[EventBus] ${eventName}`,
        'color: #3b82f6; font-weight: bold',
        payload,
        new Date().toISOString()
      );
    }

    const event = new CustomEvent(eventName, { detail: payload });
    window.dispatchEvent(event);
  },

  on<K extends EventName>(eventName: K, handler: EventHandler<K>): void {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }
    listeners.get(eventName)!.add(handler);
    window.addEventListener(eventName, handler as EventListener);
  },

  off<K extends EventName>(eventName: K, handler: EventHandler<K>): void {
    window.removeEventListener(eventName, handler as EventListener);
    listeners.get(eventName)?.delete(handler);
  },

  offAll<K extends EventName>(eventName: K): void {
    const handlers = listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => {
        window.removeEventListener(eventName, handler as EventListener);
      });
      listeners.delete(eventName);
    }
  },
};

// Expose on window for console debugging in dev
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  (window as any).EventBus = EventBus;
}

/**
 * @deprecated Use EventBus.emit('cart:add-item', payload) with typed event names directly.
 * Will be removed in v2.0.
 */
export const EVENTS = {
  CART_ADD_ITEM: 'cart:add-item',
  CART_REMOVE_ITEM: 'cart:remove-item',
  CART_UPDATE_QUANTITY: 'cart:update-quantity',
  CART_CLEAR: 'cart:clear',
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
} as const satisfies Record<string, EventName>;
