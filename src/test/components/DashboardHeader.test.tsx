import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import DashboardHeader from '@/components/DashboardHeader';

describe('DashboardHeader', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DashboardHeader />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <DashboardHeader />
    );
    expect(container).toMatchSnapshot();
  });
});