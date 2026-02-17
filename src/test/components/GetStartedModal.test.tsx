import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import GetStartedModal from '@/components/GetStartedModal';

describe('GetStartedModal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <GetStartedModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <GetStartedModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toMatchSnapshot();
  });
});