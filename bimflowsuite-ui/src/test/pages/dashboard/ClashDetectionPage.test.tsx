import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ClashDetectionPage from '@/pages/dashboard/ClashDetectionPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ClashDetectionPage renders', () => {
  render(<ClashDetectionPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ClashDetectionPage snapshot', () => {
  const { container } = render(<ClashDetectionPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
