import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UploadIFCPage from '@/pages/dashboard/UploadIFCPage';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

test('UploadIFCPage renders', () => {
  render(<UploadIFCPage />, { wrapper: Wrapper });
  expect(document.body.children).toHaveLength(1);
});

test('UploadIFCPage snapshot', () => {
  const { container } = render(<UploadIFCPage />, { wrapper: Wrapper });
  expect(container).toMatchSnapshot();
});
