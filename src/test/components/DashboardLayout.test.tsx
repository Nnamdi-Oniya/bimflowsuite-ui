import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import DashboardLayout from '@/components/DashboardLayout';

describe('DashboardLayout', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DashboardLayout />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <DashboardLayout />
    );
    expect(container).toMatchSnapshot();
  });
});