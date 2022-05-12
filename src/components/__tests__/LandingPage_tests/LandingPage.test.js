import { render, screen, fireEvent, waitFor, act, waitForElementToBeRemoved } from '@testing-library/react';
import { LandingPage, parseUrl } from "../../LandingPage/LandingPage";
import '@testing-library/jest-dom';
import { StateContext } from '../../StateContext';
import { BrowserRouter } from 'react-router-dom';

describe('LandingPage', () => {

    window.ethereum = true;
    const mockedFetch = jest.spyOn(global, 'fetch');

    const clickCreate = async () => {
        let createButton;
        await act( async () => {
            createButton = await screen.findByRole('button');
            fireEvent.click(createButton);
        })
        return createButton;
    }

    function renderWithContext(isAuthorized = true) {
        mockedFetch.mockImplementation(() => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 100, sellerAddress: '0x123', hash: '', confirmed: false }) });
        });
        render(
            <StateContext.Provider value={ {currentAddress: '0x123', balance: 100,
                _isAuthorizedSeller: async() => isAuthorized,
                _createOrder: async () => '0x987',
                _connectWallet: async () => {},
                _setListenerMetamaksAccount: async () => {}
            } } >
            <BrowserRouter>
                    <LandingPage />
            </BrowserRouter>
            </StateContext.Provider>
        );
    };

    const checkOrderRes = async () => {
        expect(await screen.findByText(/Transaction hash: 0x987/i)).toBeInTheDocument();
        expect(screen.getByText(/View on Snowtrace/i)).toBeInTheDocument();
        expect(screen.getByText(/View on Snowtrace/i).closest('a')).toHaveAttribute('href', 'https://testnet.snowtrace.io/tx/0x987');
    }

    // beforeEach(() => {
    //     renderWithContext();
    // });    
    
    it('does not find wallet, renders NoWalletDetected', async () => {
        delete window.ethereum;
        renderWithContext();
        expect(screen.getByText(/No Ethereum wallet was detected./i)).toBeInTheDocument();
        window.ethereum = true;
    });

    it('asks to connect wallet, renders ConnectWallet', async () => {
        const mockedConnectWallet = jest.fn();
        mockedFetch.mockImplementation(() => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 100, sellerAddress: '0x123', hash: '', confirmed: false }) });
        });
        render(
            <StateContext.Provider value={ {_connectWallet: mockedConnectWallet} } >
                <LandingPage />
            </StateContext.Provider>
        );
        expect(screen.getByText(/Please connect your wallet./i)).toBeInTheDocument();
        const connectButton = screen.getByRole('button');
        expect(connectButton).toBeInTheDocument();
        fireEvent.click(connectButton);
        expect(mockedConnectWallet).toHaveBeenCalled();
    });

    it('is waiting for OrderData, renders UserData and Loading', async () => {
        renderWithContext();
        await waitFor(() => expect(screen.getByText(/Loading.../i)).toBeInTheDocument());
        // expect(await screen.findByText(/Loading.../i)).toBeInTheDocument(); // does not work for some reason
        expect(screen.getByText(/Current address: 0x123/i)).toBeInTheDocument();
    });

    

    describe('Confirm order', () => {

        it('renders order data recieved and confirmation button', async () => {
            renderWithContext();
            expect(await screen.findByText(/Payment amount: 100/i)).toBeInTheDocument()
            expect(screen.getByText(/Create transaction/i)).toBeInTheDocument();
        });

        describe('Loading text after creating/confirming order', () => {

            const wait = () => {
                return new Promise(resolve => {
                  setTimeout(() => resolve(), 200)
                })
            };

            const renderWithContextWaitOnCreateOrder = (isAuthorized = true) => {
                mockedFetch.mockImplementation(() => {
                    return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 100, sellerAddress: '0x123', hash: '', confirmed: false }) });
                });
                render(
                    <StateContext.Provider value={ {currentAddress: '0x123', balance: 100,
                    _isAuthorizedSeller: async() => isAuthorized, 
                    _createOrder: async (orderAmount, sellerAddress, afterConfirm) => {
                        await wait();
                        afterConfirm();
                        await wait();
                        return '0x987';
                    } } } >
                        <LandingPage />
                    </StateContext.Provider>
                );
            };

            it('asks to confirm transaction on Metamask after clicking create transaction, then asks to wait for the transaction to be mined after confirming transaction on Metamask', async () => {
                renderWithContextWaitOnCreateOrder();
                await clickCreate();
                expect(await screen.findByText(/Please confirm the transaction on MetaMask/i)).toBeInTheDocument();
                expect(await screen.findByText(/Please wait for the transaction to be mined.../i)).toBeInTheDocument();
                await waitForElementToBeRemoved(() => screen.getByText(/Please wait for the transaction to be mined.../i)); // wait to avoid ending test and unmounting LandingPage while state still being updated
            });
    
            // it('asks to wait for the transaction to be mined after confirming transaction on Metamask', async () => {
            //     renderWithContextWaitOnCreateOrder();
            //     await clickCreate();
            //     expect(await screen.findByText(/Please wait for the transaction to be mined.../i)).toBeInTheDocument();
            // });
        });

        it('completes transaction successfully and renders Tx data', async () => {
            renderWithContext();
            await clickCreate();
            expect(await screen.findByText(/Transaction completed successfully!/i)).toBeInTheDocument();
            await checkOrderRes();
        });

        // Need to mock setHasNotified to avoid calling it, otherwise it changes immediately from notifying to notified (no delta to await findByText, no dealy), but it is private...
        // it('asks to wait for e-comm to be notified after Tx is successful', async () => {
        //     let mockedSetHasNotified = jest.spyOn(LandingPage.prototype, 'setHasNotified');
        //     renderWithContext();
        //     await clickCreate();
        //     expect(await screen.findByText(/Notifying e-commerce.../i)).toBeInTheDocument();
        //     expect(mockedSetHasNotified).toHaveBeenCalled();
        // });

        it('renders e-comm notified correctly after Tx is successful and e-comm is notified', async () => {
            renderWithContext();
            await clickCreate();
            expect(await screen.findByText(/E-commerce notified correctly/i)).toBeInTheDocument();
        });
    });

    describe('Confirm order errors', () => {
        function renderWithContextErrorOnCreateOrder(isAuthorized = true) {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 100, sellerAddress: '0x123', hash: '', confirmed: false }) });
            });
            render(
                <StateContext.Provider value={ {currentAddress: '0x123', balance: 100,
                _isAuthorizedSeller: async() => isAuthorized,
                _createOrder: async () => {
                    let err = new Error();
                    err.message = 'Cannot create order';
                    err.code = '123';
                    throw err;
                } } } >
                    <LandingPage />
                </StateContext.Provider>
            );
        };

        it('displays error when createOrder throws one', async () => {
            renderWithContextErrorOnCreateOrder();
            await clickCreate();
            expect(await screen.findByText('Error: Cannot create order (Code: 123)')).toBeInTheDocument();
        });

    });

    describe('Order already in chain', () => {
        it('renders Tx is already in chain and Tx data', async () => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 100, sellerAddress: '0x123', hash: '0x987', confirmed: true }) });
            });
            render(
                <StateContext.Provider value={{ currentAddress: '0x123', balance: 100 }} >
                    <BrowserRouter>
                    <LandingPage />
                    </BrowserRouter>
                </StateContext.Provider>
            );
            expect(await screen.findByText(/Tx is already in chain!/i)).toBeInTheDocument();
            await checkOrderRes();
        });

        it('renders Tx is already in chain e-comm is being notified', async () => {

        });

        it('renders Tx is already in chain e-comm has been notified', async () => {
            
        });
    });


});

describe('parseUrl', () => {

    delete window.location;
    window.location = new URL('https://www.ShopChain.com/landing-page?order=342');
    
    it('parses URL correctrly', () => {
        expect(parseUrl()).toBe('http://localhost:8000/orders/342');
    });
});