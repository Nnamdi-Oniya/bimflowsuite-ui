import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectsPage from '@/pages/ProjectsPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ProjectsPage renders', () => {
  render(<ProjectsPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ProjectsPage snapshot', () => {
  const { container } = render(<ProjectsPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
