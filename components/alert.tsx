import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    title?: string;
    message: string;
    onClose?: () => void;
}

const alertStyles = {
    success: {
        bg: 'bg-green-50 dark:bg-green-950/40',
        border: 'border-green-200 dark:border-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-700 dark:text-green-300',
        titleColor: 'text-green-900 dark:text-green-200',
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-950/40',
        border: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-700 dark:text-red-300',
        titleColor: 'text-red-900 dark:text-red-200',
    },
    warning: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/40',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: AlertCircle,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        textColor: 'text-yellow-700 dark:text-yellow-300',
        titleColor: 'text-yellow-900 dark:text-yellow-200',
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        border: 'border-blue-200 dark:border-blue-800',
        icon: Info,
        iconColor: 'text-blue-600 dark:text-blue-400',
        textColor: 'text-blue-700 dark:text-blue-300',
        titleColor: 'text-blue-900 dark:text-blue-200',
    },
};

export function Alert({ type, title, message, onClose }: AlertProps) {
    const style = alertStyles[type];
    const Icon = style.icon;

    return (
        <div className={`${style.bg} border ${style.border} rounded-lg p-4 flex gap-3`}>
            <Icon className={`w-5 h-5 ${style.iconColor} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
                {title && <h3 className={`font-semibold text-sm ${style.titleColor}`}>{title}</h3>}
                <p className={`text-sm ${title ? 'mt-1' : ''} ${style.textColor}`}>{message}</p>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className={`${style.iconColor} hover:opacity-70 shrink-0 transition-opacity`}
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
