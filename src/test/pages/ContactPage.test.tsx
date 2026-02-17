import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import ContactPage from '@/pages/ContactPage';

describe('ContactPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ContactPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ContactPage />
    );
    expect(container).toMatchSnapshot();
  });
});