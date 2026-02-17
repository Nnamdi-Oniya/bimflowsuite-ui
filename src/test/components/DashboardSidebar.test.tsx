import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import DashboardSidebar from '@/components/DashboardSidebar';

describe('DashboardSidebar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DashboardSidebar isOpen={true} onToggle={vi.fn()} />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <DashboardSidebar isOpen={true} onToggle={vi.fn()} />
    );
    expect(container).toMatchSnapshot();
  });
});