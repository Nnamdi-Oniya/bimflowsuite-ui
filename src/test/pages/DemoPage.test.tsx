import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DemoPage from '@/pages/DemoPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('DemoPage renders', () => {
  render(<DemoPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('DemoPage snapshot', () => {
  const { container } = render(<DemoPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
