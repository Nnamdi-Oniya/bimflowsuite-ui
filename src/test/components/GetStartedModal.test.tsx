import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GetStartedModal from '@/components/GetStartedModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('GetStartedModal renders', () => {
  render(<GetStartedModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('GetStartedModal snapshot', () => {
  const { container } = render(<GetStartedModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
