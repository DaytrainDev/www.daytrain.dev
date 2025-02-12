'use client';

import { ButtonHTMLAttributes } from 'react';
import useDarkMode from '@/lib/hooks/useDarkMode';

type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  label?: string;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
};

export function Toggle({ 
  label, 
  checked = false, 
  onToggle,
  className = '',
  ...props 
}: ToggleProps) {
  const { isDark } = useDarkMode();
  
  const handleToggle = () => {
    onToggle?.(!checked);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      className={`
        inline-flex items-center
        ${className}
      `}
      {...props}
    >
      {label && (
        <span className="mr-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </span>
      )}
      <span
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </span>
    </button>
  );
}
