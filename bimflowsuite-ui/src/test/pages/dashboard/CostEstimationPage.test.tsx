import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CostEstimationPage from '@/pages/dashboard/CostEstimationPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('CostEstimationPage renders', () => {
  const { getByText } = render(<CostEstimationPage />, { wrapper: Wrapper });
  expect(getByText('Cost Estimation')).toBeInTheDocument();
});

test('CostEstimationPage snapshot', () => {
  const { container } = render(<CostEstimationPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
