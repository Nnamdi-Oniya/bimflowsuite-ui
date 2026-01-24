import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GenerateModelPage from '@/pages/GenerateModelPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('GenerateModelPage renders', () => {
  render(<GenerateModelPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('GenerateModelPage snapshot', () => {
  const { container } = render(<GenerateModelPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
