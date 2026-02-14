// ----------------------------------------------------------------
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
// import { AuthProvider } from '@/contexts/AuthContext';        // ← uncomment if needed
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';  // ← if using tanstack query

import setupTests from '@/setupTests';

const queryClient = /* new QueryClient() */ null; // uncomment if using react-query

// Optional: wrap with providers your app normally uses
const AllProviders = ({ children }) => (
  <BrowserRouter>
    {/* <AuthProvider> */}
      {/* <QueryClientProvider client={queryClient}> */}
        {children}
      {/* </QueryClientProvider> */}
    {/* </AuthProvider> */}
  </BrowserRouter>
);

test('setupTests renders without crashing', () => {
  render(<setupTests />, { wrapper: AllProviders });
  expect(screen.getByTestId?.('root') || document.body).toBeInTheDocument();
  // Tip: add data-testid="root" to the outermost element if possible
});

test('setupTests shows meaningful content', () => {
  render(<setupTests />, { wrapper: AllProviders });

  // At least one of these should exist in a real component
  const hasText     = screen.queryByText(/./i) !== null;
  const hasHeading  = screen.queryByRole('heading') !== null;
  const hasButton   = screen.queryByRole('button') !== null;
  const hasLink     = screen.queryByRole('link') !== null;

  expect(
    hasText || hasHeading || hasButton || hasLink,
    "Component should render some meaningful text, heading, button or link"
  ).toBe(true);
});

test('setupTests matches snapshot', () => {
  const { container } = render(<setupTests />, { wrapper: AllProviders });
  expect(container).toMatchSnapshot();
});

// Add more specific tests here, examples:
// test('calls onClick when button is clicked', async () => { ... });
// test('shows error message when prop error=true', () => { ... });
// test('navigates when link is clicked', async () => { ... });
