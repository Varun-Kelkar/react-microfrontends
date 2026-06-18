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
