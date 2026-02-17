import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ServicesSection from '@/components/ServicesSection';

describe('ServicesSection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ServicesSection />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ServicesSection />
    );
    expect(container).toMatchSnapshot();
  });
});