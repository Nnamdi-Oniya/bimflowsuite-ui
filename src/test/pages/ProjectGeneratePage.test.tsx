import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ProjectGeneratePage from '@/pages/ProjectGeneratePage';

describe('ProjectGeneratePage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ProjectGeneratePage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ProjectGeneratePage />
    );
    expect(container).toMatchSnapshot();
  });
});