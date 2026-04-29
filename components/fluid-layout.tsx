import React from 'react';

interface FluidContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function FluidContainer({ children, className = '' }: FluidContainerProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

interface FluidSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function FluidSection({ children, className = '' }: FluidSectionProps) {
  return (
    <section className={`py-6 sm:py-8 lg:py-12 ${className}`}>
      {children}
    </section>
  );
}

interface FluidGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
}

export function FluidGrid({ children, className = '', cols = 1 }: FluidGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[cols];

  return (
    <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${gridCols} ${className}`}>
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className = '', children }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 ${className}`}>
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{description}</p>
        )}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
