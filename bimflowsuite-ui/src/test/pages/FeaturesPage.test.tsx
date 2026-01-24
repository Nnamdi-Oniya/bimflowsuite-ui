import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FeaturesPage from '@/pages/FeaturesPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('FeaturesPage renders', () => {
  render(<FeaturesPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('FeaturesPage snapshot', () => {
  const { container } = render(<FeaturesPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
