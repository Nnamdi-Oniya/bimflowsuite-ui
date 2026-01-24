import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ServicesSection from '@/components/ServicesSection';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ServicesSection renders', () => {
  render(<ServicesSection />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ServicesSection snapshot', () => {
  const { container } = render(<ServicesSection />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
