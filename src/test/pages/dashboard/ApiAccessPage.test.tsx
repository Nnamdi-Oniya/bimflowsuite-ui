import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ApiAccessPage from '@/pages/dashboard/ApiAccessPage';

describe('ApiAccessPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ApiAccessPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ApiAccessPage />
    );
    expect(container).toMatchSnapshot();
  });
});