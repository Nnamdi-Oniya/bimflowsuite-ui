// src/test/contexts/AuthContext.test.tsx
import { it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Rest of the file stays the same...
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  date_joined: '2025-01-01T00:00:00Z',
  is_active: true,
};

const TestComponent = () => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  const displayName = auth.user
    ? [auth.user.first_name, auth.user.last_name].filter(Boolean).join(' ') ||
      auth.user.username ||
      auth.user.email ||
      'Guest'
    : 'Not logged in';

  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {auth.user && <div data-testid="user-display">{displayName}</div>}
    </div>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

it('AuthProvider renders children and provides context (unauthenticated)', async () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
});

it('AuthProvider loads user from localStorage and marks as authenticated', async () => {
  localStorage.setItem('user_data', JSON.stringify(mockUser));
  localStorage.setItem('access_token', 'mock-jwt-token-123');

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
  expect(screen.getByTestId('user-display')).toHaveTextContent('Test User');
});

it('AuthProvider snapshot (authenticated)', async () => {
  localStorage.setItem('user_data', JSON.stringify(mockUser));
  localStorage.setItem('access_token', 'mock-jwt-token-123');

  const { container } = render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  await waitFor(() => {
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
  });

  expect(container).toMatchSnapshot();
});