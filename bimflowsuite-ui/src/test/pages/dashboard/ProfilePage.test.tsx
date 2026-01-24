import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '@/pages/dashboard/ProfilePage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ProfilePage renders', () => {
  render(<ProfilePage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ProfilePage snapshot', () => {
  const { container } = render(<ProfilePage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
