import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '@/components/Footer';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('Footer renders', () => {
  render(<Footer />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('Footer snapshot', () => {
  const { container } = render(<Footer />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
