import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TokenDialog } from '../../LandingPage/TokenDialog';
import { StateContext } from '../../StateContext';

describe('TokenDialog', () => {

    const AVAX = {
        "address": "NULL",
        "name": "AVAX",
        "symbol": "AVAX",
        "logoURI": 'avaxLogo',
        "balance": 10
    }

    let onClose = jest.fn();
    const selectedValue = AVAX;
    const open = true;

    const renderWithContext = () => {
               const { unmount } =  render(
            <StateContext.Provider value={ { 
                balance: 100,
                _getERC20Balance: async (token) => 10
            } } >
                <TokenDialog onClose={onClose} selectedValue={selectedValue} open={open} />
            </StateContext.Provider>
        );
        return unmount;
    }

    it('asks to choose a token', async () => {
        renderWithContext();
        expect(await screen.findByText(/Choose a token for the payment:/i)).toBeInTheDocument();
    });

    it('renders all Tokens avaiable', async () => {
        renderWithContext();
        expect(await screen.findByText(/Choose a token for the payment:/i)).toBeInTheDocument();
        expect(screen.getByText('AVAX')).toBeInTheDocument();
        expect(screen.getByText(/JOE/i)).toBeInTheDocument();
        expect(screen.getByText(/FISH/i)).toBeInTheDocument();
        expect(screen.getByText(/WAVAX/i)).toBeInTheDocument();
        expect(screen.getByText(/fUSDT/i)).toBeInTheDocument();
    });
    
    it('calls onClose after selecting AVAX', async () => {
        renderWithContext();
        const avax_token = await screen.findByText('AVAX');
        fireEvent.click(avax_token);
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose after selecting a token', async () => {
        renderWithContext();
        const JOE_token = await screen.findByText(/JOE/i);
        fireEvent.click(JOE_token);
        expect(onClose).toHaveBeenCalled();
    });

    // it('calls onClose when closing', async () => {
    //     renderWithContext();
    //     await screen.findByText(/Choose a token for the payment:/i);
    //     // ...
    //     expect(onClose).toHaveBeenCalled();
    // });
});