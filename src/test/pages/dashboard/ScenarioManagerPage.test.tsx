import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ScenarioManagerPage from '@/pages/dashboard/ScenarioManagerPage';

describe('ScenarioManagerPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ScenarioManagerPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ScenarioManagerPage />
    );
    expect(container).toMatchSnapshot();
  });
});