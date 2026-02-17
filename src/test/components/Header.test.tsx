import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import Header from '@/components/Header';

describe('Header', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <Header />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <Header />
    );
    expect(container).toMatchSnapshot();
  });
});