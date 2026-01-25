import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react'; 
import { MemoryRouter } from 'react-router-dom';  
import { Button } from '@/stories/Button';  

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>  // Provides context without DOM issues
    {children}
  </MemoryRouter>
);

test('Button renders', () => {
  render(<Button label="Click me" />, { wrapper: Wrapper });  // Added props for realism
  expect(screen.getByRole('button')).toBeInTheDocument();  // More specific assertion
});

test('Button snapshot', () => {
  const { container } = render(<Button label="Click me" />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});