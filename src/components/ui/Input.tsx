import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-slate-950/80 border text-slate-100 text-xs rounded-xl focus:outline-none transition ${
            icon ? 'pl-9 pr-3' : 'px-3'
          } py-2.5 ${
            error
              ? 'border-rose-500 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
              : 'border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] font-medium text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
