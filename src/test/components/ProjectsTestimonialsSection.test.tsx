import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ProjectsTestimonialsSection from '@/components/ProjectsTestimonialsSection';

describe('ProjectsTestimonialsSection', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ProjectsTestimonialsSection />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ProjectsTestimonialsSection />
    );
    expect(container).toMatchSnapshot();
  });
});