import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('AnalyticsPage renders', () => {
  render(<AnalyticsPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('AnalyticsPage snapshot', () => {
  const { container } = render(<AnalyticsPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
