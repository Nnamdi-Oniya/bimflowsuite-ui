import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ForgotPasswordPage renders', () => {
  render(<ForgotPasswordPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ForgotPasswordPage snapshot', () => {
  const { container } = render(<ForgotPasswordPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
