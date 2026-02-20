import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// 1. Define explicit types for mockAuth
interface MockUser {
  id: string;
  name: string;
  email: string;
}

interface MockAuth {
  isAuthenticated: boolean;
  user: MockUser;
  login: () => Promise<{ success: boolean }>;
  logout: () => void;
  signup: () => Promise<{ success: boolean }>;
  resetPassword: () => Promise<{ success: boolean }>;
  updateProfile: () => Promise<{ success: boolean }>;
  loading: boolean;
  error: string | null;
}

// 2. Create the mockAuth object
export const mockAuth: MockAuth = {
  isAuthenticated: true,
  user: { id: '1', name: 'Test User', email: 'test@example.com' },
  login: vi.fn().mockResolvedValue({ success: true }),
  logout: vi.fn(),
  signup: vi.fn().mockResolvedValue({ success: true }),
  resetPassword: vi.fn().mockResolvedValue({ success: true }),
  updateProfile: vi.fn().mockResolvedValue({ success: true }),
  loading: false,
  error: null,
};

// 3. Mock the AuthContext module
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// 4. Custom render function with providers
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

// 5. Hook for using mock auth in tests
export const useMockAuth = (): MockAuth => mockAuth;

// 6. Re-export testing-library helpers
export * from '@testing-library/react';