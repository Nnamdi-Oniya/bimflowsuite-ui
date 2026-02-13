import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectGeneratePage from '@/pages/ProjectGeneratePage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ProjectGeneratePage renders', () => {
  render(<ProjectGeneratePage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ProjectGeneratePage snapshot', () => {
  const { container } = render(<ProjectGeneratePage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
