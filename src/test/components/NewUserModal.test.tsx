import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import NewUserModal from '@/components/NewUserModal';

describe('NewUserModal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <NewUserModal isOpen={true} onClose={vi.fn()} onLogin={vi.fn()} onBookDemo={vi.fn()} />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <NewUserModal isOpen={true} onClose={vi.fn()} onLogin={vi.fn()} onBookDemo={vi.fn()} />
    );
    expect(container).toMatchSnapshot();
  });
});