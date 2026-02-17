import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import CTANewsSection from '@/components/CTANewsSection';

describe('CTANewsSection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <CTANewsSection />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <CTANewsSection />
    );
    expect(container).toMatchSnapshot();
  });
});