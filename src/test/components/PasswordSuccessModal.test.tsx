import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import PasswordSuccessModal from '@/components/PasswordSuccessModal';

describe('PasswordSuccessModal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <PasswordSuccessModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <PasswordSuccessModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toMatchSnapshot();
  });
});