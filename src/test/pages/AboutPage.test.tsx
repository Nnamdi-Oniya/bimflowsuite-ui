import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AboutPage from '@/pages/AboutPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('AboutPage renders', () => {
  render(<AboutPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('AboutPage snapshot', () => {
  const { container } = render(<AboutPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
