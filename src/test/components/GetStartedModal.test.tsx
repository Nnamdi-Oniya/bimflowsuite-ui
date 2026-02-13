import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GetStartedModal from '@/components/GetStartedModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

it('GetStartedModal renders', () => {
  render(<GetStartedModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

it('GetStartedModal snapshot', () => {
  const { container } = render(<GetStartedModal isOpen={true} onClose={() => {}} />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});