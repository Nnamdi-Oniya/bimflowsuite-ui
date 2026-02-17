import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import SetPasswordPage from '@/pages/SetPasswordPage';

describe('SetPasswordPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SetPasswordPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <SetPasswordPage />
    );
    expect(container).toMatchSnapshot();
  });
});