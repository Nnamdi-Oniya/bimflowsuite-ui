import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ApiAccessPage from '@/pages/dashboard/ApiAccessPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ApiAccessPage renders', () => {
  render(<ApiAccessPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ApiAccessPage snapshot', () => {
  const { container } = render(<ApiAccessPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
