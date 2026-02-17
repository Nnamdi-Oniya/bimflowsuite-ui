import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ProjectSchedulingPage from '@/pages/dashboard/ProjectSchedulingPage';

describe('ProjectSchedulingPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ProjectSchedulingPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ProjectSchedulingPage />
    );
    expect(container).toMatchSnapshot();
  });
});