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
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                                        ? 'bg-primary/10 text-primary shadow-sm'
                                        : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                                    }
                `}
                            >
                                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'opacity-100' : 'opacity-70 text-base-content/70'}`} />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
