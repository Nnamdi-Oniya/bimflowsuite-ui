import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <Footer />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <Footer />
    );
    expect(container).toMatchSnapshot();
  });
});