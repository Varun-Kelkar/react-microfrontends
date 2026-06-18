// Type declarations for federated modules
declare module 'uiKit/Button' {
  import { ButtonProps } from '@mfe-demo/ui-kit/src/components/Button';
  const Button: React.FC<ButtonProps>;
  export default Button;
}

declare module 'uiKit/Badge' {
  import { BadgeProps } from '@mfe-demo/ui-kit/src/components/Badge';
  const Badge: React.FC<BadgeProps>;
  export default Badge;
}

declare module 'uiKit/Card' {
  import { CardProps } from '@mfe-demo/ui-kit/src/components/Card';
  const Card: React.FC<CardProps>;
  export default Card;
}

declare module 'uiKit/Modal' {
  import { ModalProps } from '@mfe-demo/ui-kit/src/components/Modal';
  const Modal: React.FC<ModalProps>;
  export default Modal;
}

declare module 'uiKit/Input' {
  import { InputProps } from '@mfe-demo/ui-kit/src/components/Input';
  const Input: React.FC<InputProps>;
  export default Input;
}

declare module 'uiKit/Toast' {
  import { ToastProps } from '@mfe-demo/ui-kit/src/components/Toast';
  const Toast: React.FC<ToastProps>;
  export default Toast;
}

declare module 'productCatalog/ProductCatalog' {
  const ProductCatalog: React.FC;
  export default ProductCatalog;
}

declare module 'cart/Cart' {
  const Cart: React.FC;
  export default Cart;
}

declare module 'cart/CartBadge' {
  const CartBadge: React.FC;
  export default CartBadge;
}

declare module 'checkout/Checkout' {
  const Checkout: React.FC;
  export default Checkout;
}

declare module 'auth/SignInPage' {
  const SignInPage: React.FC;
  export default SignInPage;
}

declare module 'auth/SignUpPage' {
  const SignUpPage: React.FC;
  export default SignUpPage;
}

declare module 'auth/UserMenu' {
  const UserMenu: React.FC;
  export default UserMenu;
}

declare module 'auth/AuthGuard' {
  const AuthGuard: React.FC<{ children: React.ReactNode }>;
  export default AuthGuard;
}

declare module 'auth/ProfilePage' {
  const ProfilePage: React.FC;
  export default ProfilePage;
}
