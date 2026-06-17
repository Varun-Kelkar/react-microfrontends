import React from 'react';

export interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1"
      >
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded text-secondary-900 dark:text-secondary-100
          bg-white dark:bg-secondary-800
          placeholder:text-secondary-400 dark:placeholder:text-secondary-500
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-secondary-100 dark:disabled:bg-secondary-700 disabled:cursor-not-allowed
          ${error ? 'border-danger-500' : 'border-secondary-300 dark:border-secondary-600'}
        `}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-500">{error}</p>
      )}
    </div>
  );
};

export default Input;
