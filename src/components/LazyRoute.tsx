// src/components/LazyRoute.tsx
import React, { Suspense, lazy, useEffect } from 'react';
import type { ComponentType } from 'react';

interface LazyRouteProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  prefetch?: boolean;
  path?: string;
  index?: boolean;
  caseSensitive?: boolean;
  element?: React.ReactNode;
  children?: React.ReactNode;
}

// Cache for loaded components
const componentCache = new Map<string, Promise<any>>();

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #F8780F',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
  </div>
);

export const LazyRoute: React.FC<LazyRouteProps> = ({
  component,
  fallback = <LoadingSpinner />,
  prefetch = false,
  ...routeProps
}) => {
  const LazyComponent = lazy(() => {
    const key = component.toString();
    
    if (!componentCache.has(key)) {
      componentCache.set(key, component());
    }
    
    return componentCache.get(key)!;
  });

  // Prefetch on idle
  useEffect(() => {
    if (prefetch && typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        component();
      }, { timeout: 2000 });
    }
  }, [prefetch, component]);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...routeProps} />
    </Suspense>
  );
};