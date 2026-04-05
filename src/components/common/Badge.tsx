import React from 'react';
import { BadgeProps } from '@/types';
import { cn } from '@/utils/helpers';



export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
  published,
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-semibold shadow-sm transition-all duration-200';

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-[10px]',
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-1.5 text-sm',
  };

  const variantStyles = {
    category: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md backdrop-blur-sm hover:from-blue-600 hover:to-blue-700',
    tag: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600',
    status: published
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  };

  return (
    <span
      className={cn(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
