import { render, screen, fireEvent } from '@testing-library/react';
import ScanPage from '../app/scan/page';

describe('ScanPage', () => {
  it('accumulates and resets scans', () => {
    render(<ScanPage />);

    const input = screen.getByPlaceholderText(/scan result/i);
    const addButton = screen.getByText(/add/i);

    fireEvent.change(input, { target: { value: 'first' } });
    fireEvent.click(addButton);
    fireEvent.change(input, { target: { value: 'second' } });
    fireEvent.click(addButton);

    expect(screen.getByText('first')).toBeTruthy();
    expect(screen.getByText('second')).toBeTruthy();
    expect(screen.getByText(/export csv/i)).toBeTruthy();

    fireEvent.click(screen.getByText(/reset/i));
    expect(screen.queryByText('first')).toBeNull();
    expect(screen.queryByText(/export csv/i)).toBeNull();
  });
});
