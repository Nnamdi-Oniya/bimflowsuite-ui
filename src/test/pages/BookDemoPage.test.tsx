import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import BookDemoPage from '@/pages/BookDemoPage';

describe('BookDemoPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <BookDemoPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <BookDemoPage />
    );
    expect(container).toMatchSnapshot();
  });
});