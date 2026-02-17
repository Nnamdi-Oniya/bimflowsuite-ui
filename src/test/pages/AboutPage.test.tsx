import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import AboutPage from '@/pages/AboutPage';

describe('AboutPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <AboutPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <AboutPage />
    );
    expect(container).toMatchSnapshot();
  });
});