import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

const variantStyles = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-error',
    ghost: 'btn btn-ghost',
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
