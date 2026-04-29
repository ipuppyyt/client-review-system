import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-gray-700 hover:bg-gray-100',
};

const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    children,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            className={`
        font-medium rounded-lg transition-colors
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${(loading || disabled) ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
            disabled={loading || disabled}
            {...props}
        >
            {children}
        </button>
    );
}
