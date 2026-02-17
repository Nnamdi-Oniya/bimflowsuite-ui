import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import DemoPage from '@/pages/DemoPage';

describe('DemoPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DemoPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <DemoPage />
    );
    expect(container).toMatchSnapshot();
  });
});