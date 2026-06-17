// Type declarations for federated modules
declare module 'uiKit/Button' {
  const Button: React.FC<{
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
  }>;
  export default Button;
}

declare module 'uiKit/Card' {
  const Card: React.FC<{
    children: React.ReactNode;
    title?: string;
    image?: string;
    imageAlt?: string;
    footer?: React.ReactNode;
    className?: string;
  }>;
  export default Card;
}

declare module 'uiKit/Modal' {
  const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }>;
  export default Modal;
}

declare module 'uiKit/Badge' {
  const Badge: React.FC<{
    count: number;
    maxCount?: number;
    variant?: 'primary' | 'danger';
  }>;
  export default Badge;
}
