import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import UploadIFCPage from '@/pages/UploadIFCPage';

describe('UploadIFCPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <UploadIFCPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <UploadIFCPage />
    );
    expect(container).toMatchSnapshot();
  });
});