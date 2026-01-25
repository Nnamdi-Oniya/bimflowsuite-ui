import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('DashboardLayout renders', () => {
  render(<DashboardLayout />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('DashboardLayout snapshot', () => {
  const { container } = render(<DashboardLayout />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
