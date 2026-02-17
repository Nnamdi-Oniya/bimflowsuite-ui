import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import SettingsPage from '@/pages/dashboard/SettingsPage';

describe('SettingsPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SettingsPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <SettingsPage />
    );
    expect(container).toMatchSnapshot();
  });
});