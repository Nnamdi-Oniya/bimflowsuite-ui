import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import FAQPage from '@/pages/FAQPage';

describe('FAQPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <FAQPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <FAQPage />
    );
    expect(container).toMatchSnapshot();
  });
});