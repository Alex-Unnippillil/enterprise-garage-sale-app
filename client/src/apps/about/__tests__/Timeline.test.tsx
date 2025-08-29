import React from 'react';
import { render, screen } from '@testing-library/react';
import Timeline from '../Timeline';

describe('Timeline component', () => {
  it('renders milestone titles', () => {
    render(React.createElement(Timeline));
    expect(screen.getByText('Started Engineering Program')).toBeTruthy();
    expect(screen.getByText('Cloud Certification')).toBeTruthy();
  });

  it('renders certification badges', () => {
    render(React.createElement(Timeline));
    expect(
      screen.getByAltText('AWS Certified Cloud Practitioner')
    ).toBeTruthy();
  });

  it('renders skill heatmap', () => {
    render(React.createElement(Timeline));
    expect(screen.getByText('React')).toBeTruthy();
  });
});
