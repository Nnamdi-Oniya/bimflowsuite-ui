// src/test/components/PasswordSuccessModal.test.tsx
import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PasswordSuccessModal from '@/components/PasswordSuccessModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

it('PasswordSuccessModal renders', () => {
  render(<PasswordSuccessModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

it('PasswordSuccessModal snapshot', () => {
  const { container } = render(<PasswordSuccessModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});