import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '@/components/Header';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('Header renders', () => {
  render(<Header />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('Header snapshot', () => {
  const { container } = render(<Header />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
