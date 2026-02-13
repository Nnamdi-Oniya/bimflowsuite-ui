// src/test/components/ProjectSuccessModal.test.tsx
import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectSuccessModal from '@/components/ProjectSuccessModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

it('ProjectSuccessModal renders', () => {
  render(
    <ProjectSuccessModal 
      isOpen={true} 
      onClose={() => {}} 
      title="Success" 
      message="Project created successfully" 
      primaryAction={{
        label: "View Project",
        onClick: () => {}
      }}
    />, 
    { wrapper: Wrapper }
  );
  expect(document.body.children).toHaveLength(1);
});

it('ProjectSuccessModal snapshot', () => {
  const { container } = render(
    <ProjectSuccessModal 
      isOpen={true} 
      onClose={() => {}} 
      title="Success" 
      message="Project created successfully" 
      primaryAction={{
        label: "View Project",
        onClick: () => {}
      }}
    />, 
    { wrapper: Wrapper }
  );
  expect(container).toMatchSnapshot();
});