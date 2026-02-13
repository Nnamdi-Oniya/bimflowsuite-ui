// src/test/components/SuccessModal.test.tsx
import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SuccessModal from '@/components/SuccessModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

it('SuccessModal renders', () => {
  render(<SuccessModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

it('SuccessModal snapshot', () => {
  const { container } = render(<SuccessModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});