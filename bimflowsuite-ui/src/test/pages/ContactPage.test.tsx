import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContactPage from '@/pages/ContactPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ContactPage renders', () => {
  render(<ContactPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ContactPage snapshot', () => {
  const { container } = render(<ContactPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
