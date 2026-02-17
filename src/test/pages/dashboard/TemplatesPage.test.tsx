import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import TemplatesPage from '@/pages/dashboard/TemplatesPage';

describe('TemplatesPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <TemplatesPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <TemplatesPage />
    );
    expect(container).toMatchSnapshot();
  });
});