import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import SuccessModal from '@/components/SuccessModal';

describe('SuccessModal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SuccessModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <SuccessModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toMatchSnapshot();
  });
});