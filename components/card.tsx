import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return (
        <div
            className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 ${className}`}
        >
            {children}
        </div>
    );
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
    return (
        <div className={`p-6 border-b border-gray-200 dark:border-gray-800 ${className}`}>
            {children}
        </div>
    );
}

interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
    return <div className={`p-6 ${className}`}>{children}</div>;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`p-6 border-t border-gray-200 dark:border-gray-800 ${className}`}>
            {children}
        </div>
    );
}
