import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import HowWeWorkSection from '@/components/HowWeWorkSection';

describe('HowWeWorkSection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <HowWeWorkSection />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <HowWeWorkSection />
    );
    expect(container).toMatchSnapshot();
  });
});