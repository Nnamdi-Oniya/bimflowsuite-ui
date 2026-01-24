import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '@/stories/Header';  

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>
    {children}
  </MemoryRouter>
);

test('Header renders', () => {
  render(<Header />, { wrapper: Wrapper });
  expect(screen.getByRole('banner')).toBeInTheDocument();  // Assumes Header has role="banner" (common for headers)
});

test('Header snapshot', () => {
  const { container } = render(<Header />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});