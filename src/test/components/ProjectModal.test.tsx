import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectModal from '@/components/ProjectModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ProjectModal renders', () => {
  render(<ProjectModal />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ProjectModal snapshot', () => {
  const { container } = render(<ProjectModal />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
