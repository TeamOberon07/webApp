import { render, screen, fireEvent } from '@testing-library/react';
import { OrderData } from '../../LandingPage/OrderData';
import '@testing-library/jest-dom';
import { StateContext } from '../../StateContext';

// jest.mock('../../Loading', () => {
//     return {
//         Loading: ({text}) => <p>{text ? text : 'Loading...'}</p>
//     }
// });

describe('OrderData', () => {

    let order = {price: 10, sellerAddress: '0x123', confirmed: false};
    let createOrder = jest.fn();
    let approve = jest.fn();
    let loadingText = '';
    
    const clickConfirm = () => {
        const confirmButton = screen.getByText('Create transaction');
        fireEvent.click(confirmButton);
        return confirmButton;
    }

    beforeEach(() => {
        render(
            <StateContext.Provider value={ {currentAddress: '0x123', balance: 100,
                _getAmountsIn: async() => {},
                _ERC20isApproved: async () => {},
                _getERC20Balance: async (token) => 10
            } } >
                <OrderData 
                    order={order} 
                    createOrder={createOrder} 
                    approve={approve} 
                    loadingText={loadingText} 
                />
            </StateContext.Provider>
        );
    });

    describe('Test display order data', () => {

        it('renders order price as passed in prop', () => {
            expect(screen.getByText(new RegExp(order.price))).toBeInTheDocument();
        });
    });
    
    describe('Test button to confirm Tx', () => {

        it('initially renders button to confirm Tx', () => {
            expect(screen.getByRole('button')).toBeVisible();
        });
    
        it('removes button to confirm Tx after it has been clicked', () => {
            const confirmButton = clickConfirm();
            expect(confirmButton).not.toBeVisible();
        });
    });
    
    describe('Test Loading message', () => {

        beforeEach(() => {
            order = {price: 10, sellerAddress: '0x123', confirmed: false};
            loadingText = '';
        });

        it('initially does not render loading text when loadingText is an empty string', () => {
            expect(screen.queryAllByText(/loading.../i).length).toBe(0);
        });
    
        it('does not render loading message when order is confirmed, regardless of loadingText (1: loadingText === "" )', () => {
            order.confirmed = true;
            expect(screen.queryAllByText(/Loading.../i).length).toBe(0);
        });
    
        it('does not render loading message when order is confirmed, regardless of loadingText (2: loadingText !== "" )', () => {
            order.confirmed = true;
            loadingText = 'Loading message...';
            expect(screen.queryAllByText(/Loading message.../i).length).toBe(0);
        });

        it('renders loading message after clicking button to confirm Tx if !order.confirmed ', () => {
            loadingText = 'Loading message...';
            clickConfirm();
            expect(screen.getByText(/Loading message.../i)).toBeInTheDocument();
        });
    });

    
});