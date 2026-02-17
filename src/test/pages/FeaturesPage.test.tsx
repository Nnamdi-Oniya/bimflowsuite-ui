import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import FeaturesPage from '@/pages/FeaturesPage';

describe('FeaturesPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <FeaturesPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <FeaturesPage />
    );
    expect(container).toMatchSnapshot();
  });
});