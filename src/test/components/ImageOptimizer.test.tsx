import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ImageOptimizer from '@/components/ImageOptimizer';

describe('ImageOptimizer', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ImageOptimizer src="/test.jpg" alt="Test image" className="test-class" />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ImageOptimizer src="/test.jpg" alt="Test image" className="test-class" />
    );
    expect(container).toMatchSnapshot();
  });
});