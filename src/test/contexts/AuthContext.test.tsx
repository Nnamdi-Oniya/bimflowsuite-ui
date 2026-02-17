import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import { useAuth } from '@/contexts/AuthContext';

// Test component that uses auth
const TestAuthComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="auth-status">
        {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-email">{auth.user?.email || 'No user'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  it('provides auth context to children', () => {
    renderWithProviders(<TestAuthComponent />);
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(<TestAuthComponent />);
    expect(container).toMatchSnapshot();
  });
});