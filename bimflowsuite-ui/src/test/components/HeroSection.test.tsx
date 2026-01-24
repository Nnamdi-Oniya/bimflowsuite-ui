import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('HeroSection renders', () => {
  render(<HeroSection />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('HeroSection snapshot', () => {
  const { container } = render(<HeroSection />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
