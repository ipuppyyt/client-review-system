'use client';

import DashboardNavigation from "@/components/dashboard-navigation";
import { FluidContainer, FluidSection } from "@/components/fluid-layout";
import { LogOut, Menu, User, Settings, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <div className="text-base-content/70">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  const userInitial = session.user?.email?.charAt(0).toUpperCase() ?? '?';
  const userEmail = session.user?.email ?? '';
  const userName = session.user?.name ?? userEmail;

  return (
    <div className="flex h-screen bg-base-200 text-base-content overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-base-content/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative w-72 h-full
          bg-base-100
          border-r border-base-200
          flex flex-col transition-transform duration-300 ease-in-out z-40 shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-base-200 bg-base-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">ReviewHub</h1>
              <p className="text-xs text-base-content/60 mt-0.5">Reviews Platform</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden btn-ghost btn-circle btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <DashboardNavigation onNavigate={() => isMobile && setSidebarOpen(false)} />
        </div>

        {/* Sign Out at bottom of sidebar */}
        <div className="p-4 border-t border-base-200">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn btn-error btn-sm w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-base-200">
        {/* Top Bar */}
        <header className="bg-base-100 border-b border-base-200 px-4 sm:px-6 py-3 lg:py-4 shrink-0 z-10">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden btn-ghost btn-circle btn"
            >
              <Menu className="w-6 h-6" />
            </button>

            <h2 className="text-base font-semibold hidden sm:block">
              Welcome back{userName ? `, ${userName.split('@')[0]}` : ''}!
            </h2>

            {/* Right side actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full hover:bg-base-200 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                    <span className="text-sm font-semibold text-primary">{userInitial}</span>
                  </div>
                  <span className="text-sm text-base-content/70 hidden sm:inline-block max-w-35 truncate">
                    {userEmail}
                  </span>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-base-100 rounded-xl shadow-lg border border-base-200 py-1 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-base-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shrink-0">
                          <span className="font-semibold text-primary">{userInitial}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-base-content truncate">{userName}</p>
                          <p className="text-xs text-base-content/60 truncate">{userEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content/80 hover:text-base-content hover:bg-base-200 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-base-content/70" />
                        Account Settings
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-base-content/80 hover:text-base-content hover:bg-base-200 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-base-content/70" />
                        My Profile
                      </Link>
                    </div>

                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => { setProfileOpen(false); signOut({ callbackUrl: '/login' }); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-error/10 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <FluidSection>
            <FluidContainer>
              {children}
            </FluidContainer>
          </FluidSection>
        </div>
      </main>
    </div>
  );
}
