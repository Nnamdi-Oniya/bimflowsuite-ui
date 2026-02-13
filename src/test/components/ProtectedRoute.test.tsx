import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ProtectedRoute renders', () => {
  render(<ProtectedRoute />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ProtectedRoute snapshot', () => {
  const { container } = render(<ProtectedRoute />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
