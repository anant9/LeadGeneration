import React from 'react';
import classNames from 'classnames';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

const typeStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const typeIcons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => (
  <div className={classNames('card border', typeStyles[type], 'flex items-start justify-between')}>
    <div className="flex items-start gap-3">
      <span className="text-lg font-bold">{typeIcons[type]}</span>
      <p>{message}</p>
    </div>
    {onClose && (
      <button onClick={onClose} className="text-lg font-bold cursor-pointer">
        ×
      </button>
    )}
  </div>
);
