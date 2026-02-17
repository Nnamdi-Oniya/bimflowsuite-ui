import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ProfilePage from '@/pages/dashboard/ProfilePage';

describe('ProfilePage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ProfilePage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ProfilePage />
    );
    expect(container).toMatchSnapshot();
  });
});