// src/test/components/DashboardLayout.test.tsx
import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardLayout from '@/components/DashboardLayout';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';
const mockedUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  mockedUseAuth.mockReturnValue({
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      date_joined: '2025-01-01T00:00:00Z',
    },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

// DashboardLayout doesn't accept children props, so render it without children
it('DashboardLayout renders sidebar and branding when authenticated', async () => {
  render(<DashboardLayout />);

  await waitFor(() => {
    expect(screen.getByText('BIMFlow Suite')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
  });
});

it('DashboardLayout snapshot - authenticated', async () => {
  const { container } = render(<DashboardLayout />);

  await waitFor(() => {
    expect(screen.getByText('BIMFlow Suite')).toBeInTheDocument();
  });

  expect(container).toMatchSnapshot();
});

it('DashboardLayout snapshot - unauthenticated', async () => {
  mockedUseAuth.mockReturnValueOnce({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  });

  const { container } = render(<DashboardLayout />);
  expect(container).toMatchSnapshot();
});