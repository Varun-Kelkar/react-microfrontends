export interface RemoteEntry {
  name: string;
  key: string;
  url: string;
}

declare const __UI_KIT_URL__: string;
declare const __PRODUCT_CATALOG_URL__: string;
declare const __CART_URL__: string;
declare const __CHECKOUT_URL__: string;

export const REMOTES: RemoteEntry[] = [
  { name: 'UI Kit', key: 'uiKit', url: __UI_KIT_URL__ },
  { name: 'Product Catalog', key: 'productCatalog', url: __PRODUCT_CATALOG_URL__ },
  { name: 'Cart', key: 'cart', url: __CART_URL__ },
  { name: 'Checkout', key: 'checkout', url: __CHECKOUT_URL__ },
];
