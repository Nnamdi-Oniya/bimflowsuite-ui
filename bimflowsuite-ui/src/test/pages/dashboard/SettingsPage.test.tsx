import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SettingsPage from '@/pages/dashboard/SettingsPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('SettingsPage renders', () => {
  render(<SettingsPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('SettingsPage snapshot', () => {
  const { container } = render(<SettingsPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
