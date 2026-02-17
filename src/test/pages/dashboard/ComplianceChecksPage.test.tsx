import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import ComplianceChecksPage from '@/pages/dashboard/ComplianceChecksPage';

describe('ComplianceChecksPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ComplianceChecksPage />
    );
    expect(container).toBeDefined();
  });

  it('matches snapshot', () => {
    const { container } = renderWithProviders(
      <ComplianceChecksPage />
    );
    expect(container).toMatchSnapshot();
  });
});