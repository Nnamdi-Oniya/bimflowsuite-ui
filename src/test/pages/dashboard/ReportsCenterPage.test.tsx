import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ReportsCenterPage from '@/pages/dashboard/ReportsCenterPage';

describe('ReportsCenterPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ReportsCenterPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ReportsCenterPage />
    );
    expect(container).toMatchSnapshot();
  });
});