import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ScrollToTop from '@/components/ScrollToTop';

describe('ScrollToTop', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ScrollToTop />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ScrollToTop />
    );
    expect(container).toMatchSnapshot();
  });
});