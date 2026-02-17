import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';

describe('ForgotPasswordPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ForgotPasswordPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ForgotPasswordPage />
    );
    expect(container).toMatchSnapshot();
  });
});