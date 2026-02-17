import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import HeroSection from '@/components/HeroSection';

describe('HeroSection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <HeroSection />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <HeroSection />
    );
    expect(container).toMatchSnapshot();
  });
});