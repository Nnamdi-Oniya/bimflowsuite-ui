import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectsTestimonialsSection from '@/components/ProjectsTestimonialsSection';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ProjectsTestimonialsSection renders', () => {
  render(<ProjectsTestimonialsSection />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ProjectsTestimonialsSection snapshot', () => {
  const { container } = render(<ProjectsTestimonialsSection />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
