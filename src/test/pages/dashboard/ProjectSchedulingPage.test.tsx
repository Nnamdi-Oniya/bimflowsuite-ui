import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProjectSchedulingPage from '@/pages/dashboard/ProjectSchedulingPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ProjectSchedulingPage renders', () => {
  render(<ProjectSchedulingPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ProjectSchedulingPage snapshot', () => {
  const { container } = render(<ProjectSchedulingPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
