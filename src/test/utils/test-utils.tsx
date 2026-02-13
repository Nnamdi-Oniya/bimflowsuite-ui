// src/test/utils/test-utils.tsx
import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

interface WrapperProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: WrapperProps) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  rtlRender(ui, { wrapper: AllProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };