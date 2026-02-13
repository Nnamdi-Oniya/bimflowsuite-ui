import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CostEstimationPage from '@/pages/dashboard/CostEstimationPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('CostEstimationPage renders', () => {
  render(<CostEstimationPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('CostEstimationPage snapshot', () => {
  const { container } = render(<CostEstimationPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
