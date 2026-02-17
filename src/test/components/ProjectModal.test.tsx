import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ProjectModal from '@/components/ProjectModal';

describe('ProjectModal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ProjectModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ProjectModal isOpen={true} onClose={vi.fn()} />
    );
    expect(container).toMatchSnapshot();
  });
});