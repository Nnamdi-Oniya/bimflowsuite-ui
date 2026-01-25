import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportsCenterPage from '@/pages/dashboard/ReportsCenterPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ReportsCenterPage renders', () => {
  render(<ReportsCenterPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ReportsCenterPage snapshot', () => {
  const { container } = render(<ReportsCenterPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
