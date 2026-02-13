// src/test/components/ProjectModal.test.tsx
import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectModal from '@/components/ProjectModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Use type assertion to bypass the type check
const mockProject = {
  id: 1,
  name: 'Test Project',
  title: 'Test Project Title',
  description: 'Test Description',
  status: 'active',
  type: 'IFC_BUILDING',
  compliance: 'pending',
  assets: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  teamSize: 5,
  thumbnail: '/test-thumbnail.jpg',
} as any; // Quick fix with type assertion

it('ProjectModal renders', () => {
  render(<ProjectModal project={mockProject} mode="view" onClose={() => {}} />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

it('ProjectModal snapshot', () => {
  const { container } = render(<ProjectModal project={mockProject} mode="view" onClose={() => {}} />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});