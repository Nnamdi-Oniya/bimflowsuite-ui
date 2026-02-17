import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import CostEstimationPage from '@/pages/dashboard/CostEstimationPage';

describe('CostEstimationPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <CostEstimationPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <CostEstimationPage />
    );
    expect(container).toMatchSnapshot();
  });
});