import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ScenarioManagerPage from '@/pages/dashboard/ScenarioManagerPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ScenarioManagerPage renders', () => {
  render(<ScenarioManagerPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ScenarioManagerPage snapshot', () => {
  const { container } = render(<ScenarioManagerPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
