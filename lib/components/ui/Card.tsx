'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  ...props 
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
