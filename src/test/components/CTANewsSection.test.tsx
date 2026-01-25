import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CTANewsSection from '@/components/CTANewsSection';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('CTANewsSection renders', () => {
  render(<CTANewsSection />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('CTANewsSection snapshot', () => {
  const { container } = render(<CTANewsSection />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
