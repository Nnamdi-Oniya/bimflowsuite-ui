import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ProjectSuccessModal from '@/components/ProjectSuccessModal';

describe('ProjectSuccessModal', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ProjectSuccessModal isOpen={true} onClose={vi.fn()} projectName="Test Project" projectId="123" primaryAction={{ label: "View Project", onClick: vi.fn() }} secondaryAction={{ label: "Close", onClick: vi.fn() }} />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ProjectSuccessModal isOpen={true} onClose={vi.fn()} projectName="Test Project" projectId="123" primaryAction={{ label: "View Project", onClick: vi.fn() }} secondaryAction={{ label: "Close", onClick: vi.fn() }} />
    );
    expect(container).toMatchSnapshot();
  });
});