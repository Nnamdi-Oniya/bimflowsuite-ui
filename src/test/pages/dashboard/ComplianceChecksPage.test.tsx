import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ComplianceChecksPage from '@/pages/dashboard/ComplianceChecksPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('ComplianceChecksPage renders', () => {
  render(<ComplianceChecksPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('ComplianceChecksPage snapshot', () => {
  const { container } = render(<ComplianceChecksPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
