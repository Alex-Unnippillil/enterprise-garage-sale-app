import { render, screen, act, fireEvent } from '@testing-library/react';
import React from 'react';
import { CompactGauge } from '../compact-gauge';

jest.useFakeTimers();

describe('CompactGauge', () => {
  it('updates value at regular interval', () => {
    let current = 0;
    const getValue = jest.fn(() => ++current);
    render(React.createElement(CompactGauge, { getValue }));
    expect(screen.getByText('1')).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('opens and closes Document PiP window', async () => {
    const getValue = jest.fn(() => 50);
    const pipWindow: any = {
      document: {
        write: jest.fn(),
        close: jest.fn(),
        getElementById: jest.fn(() => ({ textContent: '', value: 0 })),
      },
      addEventListener: jest.fn((evt, cb) => { pipWindow._close = cb; }),
      removeEventListener: jest.fn(),
      close: jest.fn(() => pipWindow._close && pipWindow._close()),
      _close: null,
    };
    (window as any).documentPictureInPicture = {
      requestWindow: jest.fn().mockResolvedValue(pipWindow),
    };

    render(React.createElement(CompactGauge, { getValue }));

    const pinBtn = screen.getByRole('button', { name: /pin to pip/i });
    await act(async () => {
      fireEvent.click(pinBtn);
    });
    expect((window as any).documentPictureInPicture.requestWindow).toHaveBeenCalled();

    // Simulate closing the PiP window
    act(() => {
      pipWindow._close();
    });
    expect(pinBtn.textContent).toBe('Pin');
  });
});
