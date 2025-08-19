import { render, screen } from '@testing-library/react';
import FeatureToggle from '@/components/feature-toggle';

jest.mock('@/state/api', () => ({
  useGetFlagsQuery: () => ({ data: { on: true, off: false } }),
}));

describe('FeatureToggle', () => {
  test('shows children when flag enabled', () => {
    render(
      <FeatureToggle flag="on">
        <div>Enabled</div>
      </FeatureToggle>
    );
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  test('shows fallback when flag disabled', () => {
    render(
      <FeatureToggle flag="off" fallback={<div>Fallback</div>}>
        <div>Hidden</div>
      </FeatureToggle>
    );
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });
});
