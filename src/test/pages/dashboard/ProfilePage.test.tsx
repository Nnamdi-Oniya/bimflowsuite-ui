// src/test/pages/dashboard/ProfilePage.test.tsx
import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import ProfilePage from '@/pages/dashboard/ProfilePage';

// Mock user matching your UserProfile type and the actual displayed data
const mockUser = {
  id: 1,
  username: 'john_doe',  // This is the username
  email: 'john@example.com',
  first_name: 'John',
  last_name: 'Doe',
  date_joined: '2024-01-01T00:00:00Z',
  is_active: true,
};

// Mock the auth context with the correct structure
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refreshUser: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test('ProfilePage renders', async () => {
  render(<ProfilePage />);
  
  // Wait for the page to load and check for the user's full name
  await waitFor(() => {
    // The avatar-name shows "John Doe" (first_name + last_name)
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  // Check for other elements that should be present
  expect(screen.getByText('My Profile')).toBeInTheDocument();
  expect(screen.getByLabelText('First Name')).toHaveValue('John');
  expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
  expect(screen.getByLabelText('Email Address')).toHaveValue('john@example.com');
  
  expect(document.body.children).toHaveLength(1);
});

test('ProfilePage snapshot', async () => {
  const { container } = render(<ProfilePage />);
  
  // Wait for the page to load before taking snapshot
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  expect(container).toMatchSnapshot();
});