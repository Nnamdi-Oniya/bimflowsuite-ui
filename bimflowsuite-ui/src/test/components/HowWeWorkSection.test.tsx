import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HowWeWorkSection from '@/components/HowWeWorkSection';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('HowWeWorkSection renders', () => {
  render(<HowWeWorkSection />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('HowWeWorkSection snapshot', () => {
  const { container } = render(<HowWeWorkSection />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
