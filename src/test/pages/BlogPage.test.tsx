import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import BlogPage from '@/pages/BlogPage';

describe('BlogPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <BlogPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <BlogPage />
    );
    expect(container).toMatchSnapshot();
  });
});