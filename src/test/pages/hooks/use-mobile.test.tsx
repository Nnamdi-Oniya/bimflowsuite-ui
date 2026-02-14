import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import use-mobile from '@/pages/hooks/use-mobile';

// Mock any required dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('use-mobile', () => {
  it('renders without crashing', () => {
    render(<use-mobile />, { wrapper: Wrapper });
    expect(document.body.children).toHaveLength(1);
  });

  it('matches snapshot', () => {
    const { container } = render(<use-mobile />, { wrapper: Wrapper });
    expect(container).toMatchSnapshot();
  });
});
