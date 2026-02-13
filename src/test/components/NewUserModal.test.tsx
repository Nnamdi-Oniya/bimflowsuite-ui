// src/test/components/NewUserModal.test.tsx
import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewUserModal from '@/components/NewUserModal';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

it('NewUserModal renders', () => {
  render(
    <NewUserModal 
      isOpen={true} 
      onClose={() => {}} 
      onLogin={() => {}} 
      onBookDemo={() => {}} 
    />, 
    { wrapper: Wrapper }
  );
  expect(document.body.children).toHaveLength(1);
});

it('NewUserModal snapshot', () => {
  const { container } = render(
    <NewUserModal 
      isOpen={true} 
      onClose={() => {}} 
      onLogin={() => {}} 
      onBookDemo={() => {}} 
    />, 
    { wrapper: Wrapper }
  );
  expect(container).toMatchSnapshot();
});