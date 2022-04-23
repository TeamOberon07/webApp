import { render, screen } from '@testing-library/react';
import { Notify } from '../../LandingPage/Notify';
import '@testing-library/jest-dom';


describe('Notify', () => {
    
    it('renders "Notifying e-commerce..." if !hasNotified', () => {
        render(<Notify hasNotified={false} />);
        expect(screen.getByText(/Notifying e-commerce.../i)).toBeInTheDocument();
    });

    it('renders "E-commerce notified correctly" if hasNotified', () => {
        render(<Notify hasNotified={true} />);
        expect(screen.getByText(/E-commerce notified correctly/i)).toBeInTheDocument();
    });
});