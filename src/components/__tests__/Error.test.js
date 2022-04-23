import { render, screen } from '@testing-library/react';
import { Error } from '../Error';
import '@testing-library/jest-dom';



describe("Error", () => {

    it('renders same text as passed into message prop', () => {
        render(<Error message={'Error: invalid order'} />);
        expect(screen.getByText(/Error: invalid order/i)).toBeInTheDocument();
    });
    
    it('renders error with class "error"', () => {
        render(<Error message={'Error: invalid order'} />);
        expect(screen.getByText(/Error: invalid order/i)).toHaveClass('error');
    });
    
    it('renders error as $element(to be defined...)', () => {
        render(<Error message={'Error: invalid order'} />);
        expect(screen.getByRole('heading')).toBeInTheDocument();
    });
});