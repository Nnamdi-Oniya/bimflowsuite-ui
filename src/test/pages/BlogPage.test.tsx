import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlogPage from '@/pages/BlogPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('BlogPage renders', () => {
  render(<BlogPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('BlogPage snapshot', () => {
  const { container } = render(<BlogPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
