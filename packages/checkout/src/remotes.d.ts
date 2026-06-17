// Type declarations for federated modules
declare module 'uiKit/Button' {
  const Button: React.FC<{
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }>;
  export default Button;
}

declare module 'uiKit/Input' {
  const Input: React.FC<{
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel';
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
  }>;
  export default Input;
}

declare module 'uiKit/Toast' {
  const Toast: React.FC<{
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
  }>;
  export default Toast;
}
