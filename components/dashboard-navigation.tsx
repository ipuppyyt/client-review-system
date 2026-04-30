'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    MessageSquare,
    Palette,
    Settings,
    Users,
    Code,
} from 'lucide-react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface DashboardNavigationProps {
    onNavigate?: () => void;
}

const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clients', label: 'Clients', icon: Users },
    { href: '/dashboard/reviews', label: 'Reviews', icon: MessageSquare },
    { href: '/dashboard/branding', label: 'Branding', icon: Palette },
    { href: '/dashboard/api-docs', label: 'API Docs', icon: Code },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardNavigation({ onNavigate }: DashboardNavigationProps) {
    const pathname = usePathname();

    return (
        <nav className="flex-1 p-2 sm:p-4 overflow-y-auto">
            <ul className="space-y-1">
                {navItems.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                        : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                    }
                `}
                            >
                                <item.icon className="w-4 h-4 shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
