import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import LoginPage from '@/pages/LoginPage';

describe('LoginPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <LoginPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <LoginPage />
    );
    expect(container).toMatchSnapshot();
  });
});