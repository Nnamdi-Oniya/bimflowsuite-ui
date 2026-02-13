import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CreateProjectPage from '@/pages/dashboard/CreateProjectPage';

// --------------------
// Mock ID generators
// --------------------
vi.mock('@/utils/id-generator', () => ({
  generateProjectId: () => 'PRJ-TEST-123',
  generateProjectNumber: () => 'PRJ-TEST-123',
}));

vi.mock('nanoid', () => ({
  nanoid: () => 'test-id-123',
}));

// --------------------
// Mock Date utilities
// --------------------
vi.mock('@/utils/date', () => ({
  getCurrentDate: () => '2024-01-01',
  formatDate: () => '2024-01-01',
  getCurrentTimestamp: () => '2024-01-01T00:00:00.000Z',
}));

// --------------------
// Mock AuthContext
// --------------------
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  date_joined: '2024-01-01T00:00:00Z',
  is_active: true,
};

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

// --------------------
// Router Wrapper
// --------------------
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

beforeEach(() => {
  vi.clearAllMocks();
});

// ======================================================
// TEST: Renders form correctly
// ======================================================
test('CreateProjectPage renders form and title', async () => {
  const { container } = render(<CreateProjectPage />, { wrapper: Wrapper });

  // Wait for heading
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /create new project/i }))
      .toBeInTheDocument();
  });

  // Project number field (disabled)
  const projectNumberInput =
    container.querySelector<HTMLInputElement>('input[name="project_number"]');

  expect(projectNumberInput).toBeInTheDocument();
  expect(projectNumberInput).toBeDisabled();

  // Project Name (via accessible label)
  expect(screen.getByLabelText(/project name/i)).toBeInTheDocument();

  // Description textarea
  expect(
    screen.getByPlaceholderText(/describe the project scope/i)
  ).toBeInTheDocument();

  // Buttons
  expect(screen.getByRole('button', { name: /next/i }))
    .toBeInTheDocument();

  expect(screen.getByRole('button', { name: /cancel/i }))
    .toBeInTheDocument();
});

// ======================================================
// TEST: Snapshot
// ======================================================
test('CreateProjectPage matches snapshot', async () => {
  const { container } = render(<CreateProjectPage />, { wrapper: Wrapper });

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: /create new project/i }))
      .toBeInTheDocument();
  });

  expect(container).toMatchSnapshot();
});
