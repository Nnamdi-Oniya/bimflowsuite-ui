import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ScrollToTop renders', () => {
  render(<ScrollToTop />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ScrollToTop snapshot', () => {
  const { container } = render(<ScrollToTop />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
