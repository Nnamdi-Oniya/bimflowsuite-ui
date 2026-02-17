import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';

describe('AnalyticsPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <AnalyticsPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <AnalyticsPage />
    );
    expect(container).toMatchSnapshot();
  });
});