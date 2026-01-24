import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('LoginPage renders', () => {
  render(<LoginPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('LoginPage snapshot', () => {
  const { container } = render(<LoginPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
