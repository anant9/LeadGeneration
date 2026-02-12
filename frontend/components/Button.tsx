import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
  success: 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400',
};

const sizeStyles = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => (
  <button
    className={classNames(
      variantStyles[variant],
      sizeStyles[size],
      'rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed',
      fullWidth && 'w-full',
      className
    )}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? '⏳ Loading...' : children}
  </button>
);
