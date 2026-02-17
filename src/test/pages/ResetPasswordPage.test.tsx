import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

describe('ResetPasswordPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ResetPasswordPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ResetPasswordPage />
    );
    expect(container).toMatchSnapshot();
  });
});