import { render, screen, fireEvent, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import { OrderData } from '../../LandingPage/OrderData';
import '@testing-library/jest-dom';
import { StateContext } from '../../StateContext';
import TOKENS from "../../LandingPage/tokenlist";

// jest.mock('../../Loading', () => {
//     return {
//         Loading: ({text}) => <p>{text ? text : 'Loading...'}</p>
//     }
// });

describe('OrderData', () => {

    const convertRate = 10**18;
    const tokenPriceWEI = 3 * convertRate;
    const tokenPrice = 3;
    let tokenBalance = 1000;
    let order = {price: tokenPrice, sellerAddress: '0x123', confirmed: false};
    let createOrder = jest.fn(() => true);
    let approve = jest.fn(() => Promise.resolve(true));
    let mocked_ERC20isApproved = jest.fn();
    let loadingText = '';
    const ButtonTypes = {
        tokenButton: 0,
        approveButton: 1,
        createButton: 2
    }
    const TokenItems = {
        AVAX: 0,
        JOE: 1,
        FISH: 2,
        WAVAX: 3,
        fUSDT: 4
    }
    const TokenPricesWEI = {
        fUSDT: tokenPriceWEI,
        AVAX: tokenPriceWEI * 2,
        JOE: tokenPriceWEI * 3,
        FISH: tokenPriceWEI * 4,
        WAVAX: tokenPriceWEI * 5
    }
    const TokenPrices = {
        fUSDT: tokenPrice,
        AVAX: tokenPrice  * 2,
        JOE: tokenPrice  * 3,
        FISH: tokenPrice  * 4,
        WAVAX: tokenPrice  * 5,
    }
    
    const clickButton = (buttonType) => {
        const allButtons = screen.getAllByRole('button');
        // if(no approve button)
        if(buttonType === ButtonTypes.createButton && allButtons.length === 2) {
            buttonType--;
        }
        const button = allButtons[buttonType];
        fireEvent.click(button);
        return button;
    }

    const clickToken = async (token) => {
        const token_li = screen.getAllByRole('listitem')[token];
        fireEvent.click(token_li);
        await waitForElementToBeRemoved(() => screen.getByText(/Choose a token for the payment/i))
        return token_li;
    }

    const renderWithContext = async () => {
        render(
            <StateContext.Provider value={ {currentAddress: '0x123', balance: tokenBalance,
                _getAmountsIn: async(selectedValue) => {
                    switch(selectedValue.symbol) {
                        case 'AVAX':
                            return TokenPricesWEI.AVAX;
                        case 'JOE':
                            return TokenPricesWEI.JOE;
                        case 'FISH':
                            return TokenPricesWEI.FISH;
                        case 'WAVAX':
                            return TokenPricesWEI.WAVAX;
                        case 'fUSDT':
                            return TokenPricesWEI.fUSDT;
                    }
                },
                _ERC20isApproved: mocked_ERC20isApproved,
                _getERC20Balance: async (token) => tokenBalance
            } } >
                <OrderData 
                    order={order} 
                    createOrder={createOrder} 
                    approve={approve} 
                    loadingText={loadingText} 
                />
            </StateContext.Provider>
        );
        
        await waitFor(() => expect(screen.getByText(/Create transaction/i)).toBeEnabled());
    }

    describe('Test display order data', () => {

        test('TU27 renders order price as passed in prop', async () => {
            await renderWithContext();
            const expected = `$${order.price} fUSDt`;
            // const balance = parseFloat(tokenBalance.toFixed(4))
            expect(await screen.findByText(`Balance: 1000.0000`)).toBeInTheDocument();
            expect(await screen.findByText(/Payment amount in \$fUSDt:/i)).toBeInTheDocument();
            expect(await screen.findByText(expected)).toBeInTheDocument();
        });
    });

    describe('Test button to change token', () => {

        test('TU28 initially renders AVAX as selected token with correct balance', async () => {
            await renderWithContext();
            expect(await screen.findByText(`${TokenPrices.AVAX} AVAX`)).toBeInTheDocument();
        });

        test('TU29 displays all avaiable tokens when clicking button to change selected token', async () => {
            await renderWithContext();
            clickButton(ButtonTypes.tokenButton);
            expect(await screen.findByText('AVAX')).toBeInTheDocument();
            expect(screen.getByText(/JOE/i)).toBeInTheDocument();
            expect(screen.getByText(/FISH/i)).toBeInTheDocument();
            expect(screen.getByText(/WAVAX/i)).toBeInTheDocument();
            expect(screen.getAllByText(/fUSDT/i).length).toBe(3);
        });

        test('TU30 updates balance when token changed', async () => {
            await renderWithContext();
            mocked_ERC20isApproved.mockReturnValue(Promise.resolve(false));
            clickButton(ButtonTypes.tokenButton);
            await clickToken(TokenItems.JOE);
            expect(await screen.findByText(`${TokenPrices.JOE} JOE`)).toBeInTheDocument();
            // change balance and test update
        });
    });

    describe('Test button to approve', () => {

        test('TU31 renders Approve button when selecting token different to AVAX', async () => {
            mocked_ERC20isApproved.mockReturnValue(Promise.resolve(false));
            await renderWithContext();
            clickButton(ButtonTypes.tokenButton);
            await clickToken(TokenItems.fUSDT);

            const approveBtn = await screen.findByRole('button', { name: /Approve/i});
            expect(approveBtn).toBeInTheDocument();
            expect(approveBtn).not.toHaveClass('disabled-button');

            const createBtn = await screen.findByText(/Create transaction/i);
            expect(createBtn).toBeInTheDocument();
            expect(createBtn).toHaveClass('disabled-button');

            mocked_ERC20isApproved.mockReturnValue(Promise.resolve(true));
            approve.mockReturnValueOnce(Promise.resolve(true))
            clickButton(ButtonTypes.approveButton);

            await waitFor(() => expect(approveBtn).toHaveTextContent(/Approved/i));
            await waitFor(() => expect(createBtn).not.toHaveClass('disabled-button'));
        });

    });
    
    describe('Test button to confirm Tx', () => {

        test('TU32 checks that transaction button is enabled when balance > price', async () => {
            await renderWithContext();
            const createButton = screen.getByText('Create transaction');
            expect(createButton).toBeInTheDocument();
            expect(createButton).toBeEnabled();
        });
        
        test('TU33 checks that transaction button is NOT enabled when balance < price', async () => {
            const oldTokenBalance = tokenBalance;
            tokenBalance = 1;
            await renderWithContext();
            const createButton = screen.getByText('Insufficient Balance');
            expect(createButton).toBeInTheDocument();
            expect(createButton).toHaveClass('disabled-button');
            tokenBalance = oldTokenBalance;
        });

        test('TU34 calls createOrder with correct selected value and amount when button createOrder is clicked', async () => {
            mocked_ERC20isApproved.mockReturnValue(Promise.resolve(true));
            await renderWithContext();
            clickButton(ButtonTypes.tokenButton);
            await clickToken(TokenItems.FISH);
            clickButton(ButtonTypes.createButton);
            await waitFor(() => expect(createOrder).toHaveBeenCalledWith(TOKENS[1], TokenPricesWEI.FISH));
        });

        // it('calls createOrder with correct selected value and amount when button createOrder clicked', async () => {
        //     mocked_ERC20isApproved.mockReturnValue(Promise.resolve(true));
        //     await renderWithContext();
        //     clickButton(ButtonTypes.tokenButton);
        //     await clickToken(TokenItems.FISH);
        //     clickButton(ButtonTypes.createButton);
        //     await waitFor(() => expect(createOrder).toHaveBeenCalled());
            
        // });
    
        test('TU35 removes button to confirm Tx after it has been clicked', async () => {
            await renderWithContext();
            const confirmButton = clickButton(ButtonTypes.createButton);
            expect(confirmButton).not.toBeVisible();
        });
    });
    
    // describe('Test Loading message', () => {

        // beforeEach(() => {
        //     order = {price: tokenPrice, sellerAddress: '0x123', confirmed: false};
        //     loadingText = '';
        // });

        // it('initially does not render loading text when loadingText is an empty string', async () => {
        //     await renderWithContext();
        //     expect(screen.queryAllByText(/loading.../i).length).toBe(0);
        // });
    
        // it('does not render loading message when order is confirmed, regardless of loadingText (1: loadingText === "" )', async () => {
        //     await renderWithContext();
        //     order.confirmed = true;
        //     expect(screen.queryAllByText(/Loading.../i).length).toBe(0);
        // });
    
        // it('does not render loading message when order is confirmed, regardless of loadingText (2: loadingText !== "" )', async () => {
        //     await renderWithContext();
        //     order.confirmed = true;
        //     loadingText = 'Loading message...';
        //     expect(screen.queryAllByText(/Loading message.../i).length).toBe(0);
        // });

        // it('asks to confirm transaction after clicking Create transaction ', async () => {
        //     await renderWithContext();
        //     clickButton(ButtonTypes.createButton);
        //     expect(screen.getByText(/Loading/i)).toBeInTheDocument();
        // });
    // });

    
});