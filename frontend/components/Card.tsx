import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children }) => (
  <div className="card">
    {title && <h2 className="text-xl font-bold mb-2">{title}</h2>}
    {subtitle && <p className="text-gray-600 text-sm mb-4">{subtitle}</p>}
    {children}
  </div>
);

export const Loading: React.FC = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin">⏳</div>
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);
