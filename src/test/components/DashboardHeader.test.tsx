import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardHeader from '@/components/DashboardHeader';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('DashboardHeader renders', () => {
  render(<DashboardHeader />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('DashboardHeader snapshot', () => {
  const { container } = render(<DashboardHeader />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
