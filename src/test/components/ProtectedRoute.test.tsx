// src/test/components/ProtectedRoute.test.tsx

import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { vi } from 'vitest';
import { renderWithMemoryRouter, setAuthenticated } from '../protected-route-test-utils';

// IMPORTANT: mock the correct path
vi.mock('../../utils/authUtils', () => ({
  isUserAuthenticated: () => mockIsAuthenticated
}));

let mockIsAuthenticated = true;

describe('ProtectedRoute', () => {

  beforeEach(() => {
    mockIsAuthenticated = true;
  });

  it('renders children when authenticated', async () => {
    mockIsAuthenticated = true;

    renderWithMemoryRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('redirects to login when not authenticated', async () => {
    mockIsAuthenticated = false;

    renderWithMemoryRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });
  });

});
