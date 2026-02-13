import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SetPasswordPage from '@/pages/SetPasswordPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('SetPasswordPage renders', () => {
  render(<SetPasswordPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('SetPasswordPage snapshot', () => {
  const { container } = render(<SetPasswordPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
