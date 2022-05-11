import { render, screen } from '@testing-library/react';
import { TxHash } from '../../LandingPage/TxHash';
import '@testing-library/jest-dom';


describe('TxHash', () => {

    const hash = '0x123456789';

    beforeEach(() => {
        render(<TxHash hash={hash} />);
    });
    
    it('renders same text as passed into hash prop', () => {
        const regHash = new RegExp(hash);
        expect(screen.getByText(regHash)).toBeInTheDocument();
    });
    
    it('renders link to Rinkeby with same hash as passed into prop', () => {
        expect(screen.getByRole('link')).toHaveAttribute('href', 'https://rinkeby.etherscan.io//tx/' + hash);
    });
});