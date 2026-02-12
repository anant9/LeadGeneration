import React from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  className,
  ...props
}) => (
  <div className="mb-4">
    {label && <label className="label">{label}</label>}
    <input
      className={classNames(
        'input',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    {helpText && !error && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
  </div>
);
