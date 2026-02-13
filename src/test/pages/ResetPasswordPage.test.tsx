import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ResetPasswordPage renders', () => {
  render(<ResetPasswordPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ResetPasswordPage snapshot', () => {
  const { container } = render(<ResetPasswordPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
