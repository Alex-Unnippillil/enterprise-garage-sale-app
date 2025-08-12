/** @jest-environment node */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { useIsMobile } from './use-mobile';

function TestComponent() {
  useIsMobile();
  return null;
}

describe('useIsMobile', () => {
  it('does not crash in a Node environment', () => {
    expect(() => renderToString(React.createElement(TestComponent))).not.toThrow();
  });
});

