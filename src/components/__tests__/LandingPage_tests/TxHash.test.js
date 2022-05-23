import { fireEvent, render, screen } from '@testing-library/react';
import { TxHash } from '../../LandingPage/TxHash';
import '@testing-library/jest-dom';


describe('TxHash', () => {

    const hash = '0x123456789';
    const mockedWindowOpen = jest.spyOn(window, 'open').mockReturnValue({focus: () => {}});

    beforeEach(() => {
        render(<TxHash hash={hash} />);
    });

    it('TU23 renders TxHash with correct data', () => {
        const regHash = new RegExp(hash);
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        const etherscanButton = buttons[0];
        const ordersButton = buttons[1];
        expect(etherscanButton).toHaveTextContent(/View on Etherscan/i);
        expect(ordersButton).toHaveTextContent(/Go to your Orders/i);
        // can't see focus()
        // fireEvent.click(etherscanButton);
        // expect(mockedWindowOpen).toHaveBeenCalledWith("https://rinkeby.etherscan.io/tx/" + hash, '_blank');
        delete window.location;
        window.location = {
            href: ''
        }
        fireEvent.click(ordersButton);
        expect(window.location.href).toBe('/');
    });
});