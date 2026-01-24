import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('DashboardSidebar renders', () => {
  render(<DashboardSidebar />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('DashboardSidebar snapshot', () => {
  const { container } = render(<DashboardSidebar />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
