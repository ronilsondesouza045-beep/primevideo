import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-xs px-4 py-2.5',
    lg: 'text-sm px-6 py-3.5'
  };

  const variantStyles = {
    primary: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 border border-red-500/30',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/30',
    ghost: 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
    outline: 'border border-slate-700 text-slate-200 hover:bg-slate-800'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
};
