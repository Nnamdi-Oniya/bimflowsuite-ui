import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';

// Mock auth state
export let isAuthenticated = true;

// Mock the auth utility
vi.mock('@/utils/authUtils', () => ({
  isUserAuthenticated: () => isAuthenticated
}));

// Mock the custom event
window.addEventListener = vi.fn();
window.removeEventListener = vi.fn();

// Custom render for ProtectedRoute tests
export function renderWithMemoryRouter(
  ui: React.ReactElement,
  initialEntries: string[] = ['/dashboard'],
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={ui} />
      </Routes>
    </MemoryRouter>,
    options
  );
}

// Helper to update auth state
export const setAuthenticated = (value: boolean) => {
  isAuthenticated = value;
};