import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ClashDetectionPage from '@/pages/dashboard/ClashDetectionPage';

describe('ClashDetectionPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ClashDetectionPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ClashDetectionPage />
    );
    expect(container).toMatchSnapshot();
  });
});