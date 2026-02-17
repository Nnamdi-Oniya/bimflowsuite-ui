import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import CreateProjectPage from '@/pages/dashboard/CreateProjectPage';

describe('CreateProjectPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <CreateProjectPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <CreateProjectPage />
    );
    expect(container).toMatchSnapshot();
  });
});