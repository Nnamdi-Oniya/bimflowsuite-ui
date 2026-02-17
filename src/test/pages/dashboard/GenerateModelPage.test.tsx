import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import GenerateModelPage from '@/pages/dashboard/GenerateModelPage';

describe('GenerateModelPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <GenerateModelPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <GenerateModelPage />
    );
    expect(container).toMatchSnapshot();
  });
});