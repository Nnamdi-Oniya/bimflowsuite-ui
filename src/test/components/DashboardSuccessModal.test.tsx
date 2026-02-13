import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardSuccessModal from '@/components/DashboardSuccessModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

it('DashboardSuccessModal renders', () => {
  render(
    <DashboardSuccessModal 
      isOpen={true} 
      onClose={() => {}} 
      title="Test Title" 
      message="Test Message" 
    />, 
    { wrapper: Wrapper }
  );
  expect(document.body.children).toHaveLength(1);
});

it('DashboardSuccessModal snapshot', () => {
  const { container } = render(
    <DashboardSuccessModal 
      isOpen={true} 
      onClose={() => {}} 
      title="Test Title" 
      message="Test Message" 
    />, 
    { wrapper: Wrapper }
  );
  expect(container).toMatchSnapshot();
});