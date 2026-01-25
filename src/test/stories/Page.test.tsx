import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Page } from '@/stories/Page';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>
    {children}
  </MemoryRouter>
);

test('Page renders', () => {
  render(<Page />, { wrapper: Wrapper });
  expect(screen.getByRole('article')).toBeInTheDocument();  // Matches <article> root
  // Or: expect(screen.getByText('Pages in Storybook')).toBeInTheDocument();
});

test('Page snapshot', () => {
  const { container } = render(<Page />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});