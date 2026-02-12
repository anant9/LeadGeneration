import React from 'react';
import classNames from 'classnames';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ label: string; value: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className,
  ...props
}) => (
  <div className="mb-4">
    {label && <label className="label">{label}</label>}
    <select
      className={classNames(
        'input',
        error && 'border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);
