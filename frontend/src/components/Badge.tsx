import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-secondary/10 text-secondary',
    warning: 'bg-accent/10 text-accent-dark',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-primary/10 text-primary',
    default: 'bg-gray-100 text-text-secondary',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
