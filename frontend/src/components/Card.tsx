import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', style, hover = false, onClick }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-gray-200 p-6
        shadow-sm hover:shadow-md
        transition-all duration-300
        ${hover ? 'hover:shadow-lg hover:border-primary/20 cursor-pointer' : ''}
        ${className}
      `}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
