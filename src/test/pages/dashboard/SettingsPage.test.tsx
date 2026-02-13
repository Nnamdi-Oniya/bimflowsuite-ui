// src/test/pages/dashboard/SettingsPage.test.tsx
import { it, expect } from 'vitest';
import { render } from '@/test/utils/test-utils';
import SettingsPage from '@/pages/dashboard/SettingsPage';

it('SettingsPage renders', () => {
  render(<SettingsPage />);
  expect(document.body.children).toHaveLength(1);
});

it('SettingsPage snapshot', () => {
  const { container } = render(<SettingsPage />);
  expect(container).toMatchSnapshot();
});