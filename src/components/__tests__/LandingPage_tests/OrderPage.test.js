import { render, screen, fireEvent } from '@testing-library/react';
import { OrderData } from '../../LandingPage/OrderData';
import '@testing-library/jest-dom';

// jest.mock('../../Loading', () => {
//     return {
//         Loading: ({text}) => <p>{text ? text : 'Loading...'}</p>
//     }
// });

describe('OrderData', () => {

    let order = {price: 10, sellerAddress: '0x123', confirmed: false};
    let confirmOrder = jest.fn();
    let loadingText = '';
    
    const clickConfirm = () => {
        const confirmButton = screen.getByRole('button');
        fireEvent.click(confirmButton);
        return confirmButton;
    }

    describe('Test display order data', () => {

        it('renders order price as passed in prop', () => {
            render(<OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />);
            expect(screen.getByText(new RegExp(order.price))).toBeInTheDocument();
        });
    });
    
    describe('Test button to confirm Tx', () => {

        it('initially renders button to confirm Tx', () => {
            render(<OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />);
            expect(screen.getByRole('button')).toBeVisible();
        });
    
        it('removes button to confirm Tx after it has been clicked', () => {
            render(<OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />);
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
            render(<OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />);
            expect(screen.queryAllByText(/loading.../i).length).toBe(0);
        });
    
        it('does not render loading message when order is confirmed, regardless of loadingText (1: loadingText === "" )', () => {
            order.confirmed = true;
            render(<OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />);
            expect(screen.queryAllByText(/Loading.../i).length).toBe(0);
        });
    
        it('does not render loading message when order is confirmed, regardless of loadingText (2: loadingText !== "" )', () => {
            order.confirmed = true;
            loadingText = 'Loading message...';
            render(<OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />);
            expect(screen.queryAllByText(/Loading message.../i).length).toBe(0);
        });

        it('renders loading message after clicking button to confirm Tx if !order.confirmed ', () => {
            loadingText = 'Loading message...';
            render(<OrderData order={order} confirmOrder={confirmOrder} loadingText={loadingText} />);
            clickConfirm();
            expect(screen.getByText(/Loading message.../i)).toBeInTheDocument();
        });
    });

    
});