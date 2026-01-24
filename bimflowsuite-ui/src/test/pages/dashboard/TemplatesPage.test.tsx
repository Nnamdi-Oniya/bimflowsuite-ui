import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import TemplatesPage from '@/pages/dashboard/TemplatesPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('TemplatesPage renders', () => {
  render(<TemplatesPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('TemplatesPage snapshot', () => {
  const { container } = render(<TemplatesPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
