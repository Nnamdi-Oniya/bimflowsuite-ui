import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import DashboardSuccessModal from '@/components/DashboardSuccessModal';

describe('DashboardSuccessModal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DashboardSuccessModal isOpen={true} onClose={vi.fn()} title="Success!" message="Operation completed successfully" />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <DashboardSuccessModal isOpen={true} onClose={vi.fn()} title="Success!" message="Operation completed successfully" />
    );
    expect(container).toMatchSnapshot();
  });
});