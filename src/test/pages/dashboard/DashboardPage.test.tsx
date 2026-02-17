import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import DashboardPage from '@/pages/dashboard/DashboardPage';

describe('DashboardPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DashboardPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <DashboardPage />
    );
    expect(container).toMatchSnapshot();
  });
});