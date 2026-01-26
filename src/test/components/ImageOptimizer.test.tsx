import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ImageOptimizer from '@/components/ImageOptimizer';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ImageOptimizer renders', () => {
  render(<ImageOptimizer src="/test.jpg" alt="Test image" />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ImageOptimizer snapshot', () => {
  const { container } = render(<ImageOptimizer src="/test.jpg" alt="Test image" />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
