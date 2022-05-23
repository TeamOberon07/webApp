import { render, screen } from '@testing-library/react';
import { Error } from '../../Error';
import '@testing-library/jest-dom';

describe("Error", () => {
    test('TU02 renders Error correctly', () => {
        render(<Error message={'Error: invalid order'} />);
        expect(screen.getByText(/Error: invalid order/i)).toBeInTheDocument();
        expect(screen.getByText(/Error: invalid order/i)).toHaveClass('error');
        expect(screen.getByRole('heading')).toBeInTheDocument();
    });
});