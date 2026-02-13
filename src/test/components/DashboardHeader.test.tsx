// src/test/components/DashboardHeader.test.tsx
import { it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardHeader from '@/components/DashboardHeader';

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
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
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

it('renders without crashing', async () => {
  render(<DashboardHeader onMobileToggle={() => {}} />);
  const header = screen.getByRole('banner') || document.querySelector('.dashboard-header');
  expect(header).toBeInTheDocument();
});

it('shows user avatar with correct alt text', async () => {
  render(<DashboardHeader onMobileToggle={() => {}} />);
  const avatar = await screen.findByAltText('Test User');
  expect(avatar).toBeInTheDocument();
  expect(avatar).toHaveAttribute('src', expect.stringContaining('ui-avatars.com'));
});

it('calls onMobileToggle when sidebar toggle button is clicked', async () => {
  const mockToggle = vi.fn();
  render(<DashboardHeader onMobileToggle={mockToggle} />);
  const toggleButton = await screen.findByLabelText('Toggle sidebar');
  expect(toggleButton).toBeInTheDocument();
  toggleButton.click();
  expect(mockToggle).toHaveBeenCalledTimes(1);
});

it('matches snapshot (authenticated)', async () => {
  const { container } = render(<DashboardHeader onMobileToggle={() => {}} />);
  await waitFor(() => {
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
  });
  expect(container).toMatchSnapshot();
});