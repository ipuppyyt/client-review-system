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
        bg: 'alert alert-success',
        border: '',
        icon: CheckCircle,
        iconColor: '',
        textColor: '',
        titleColor: '',
    },
    error: {
        bg: 'alert alert-error',
        border: '',
        icon: AlertCircle,
        iconColor: '',
        textColor: '',
        titleColor: '',
    },
    warning: {
        bg: 'alert alert-warning',
        border: '',
        icon: AlertCircle,
        iconColor: '',
        textColor: '',
        titleColor: '',
    },
    info: {
        bg: 'alert alert-info',
        border: '',
        icon: Info,
        iconColor: '',
        textColor: '',
        titleColor: '',
    },
};

export function Alert({ type, title, message, onClose }: AlertProps) {
    const style = alertStyles[type];
    const Icon = style.icon;

    return (
        <div className={`${style.bg} shadow-lg`}>
            <Icon className="w-6 h-6" />
            <div>
                {title && <div className="font-bold">{title}</div>}
                <div>{message}</div>
            </div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
