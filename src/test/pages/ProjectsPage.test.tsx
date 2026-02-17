import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ProjectsPage from '@/pages/ProjectsPage';

describe('ProjectsPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ProjectsPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ProjectsPage />
    );
    expect(container).toMatchSnapshot();
  });
});