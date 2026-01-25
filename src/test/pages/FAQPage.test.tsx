import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FAQPage from '@/pages/FAQPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('FAQPage renders', () => {
  render(<FAQPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('FAQPage snapshot', () => {
  const { container } = render(<FAQPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
