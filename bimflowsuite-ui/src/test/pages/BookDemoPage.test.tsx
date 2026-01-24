import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookDemoPage from '@/pages/BookDemoPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('BookDemoPage renders', () => {
  render(<BookDemoPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('BookDemoPage snapshot', () => {
  const { container } = render(<BookDemoPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
