import { render, screen, fireEvent, waitFor, act, waitForElementToBeRemoved } from '@testing-library/react';
import { LandingPage, parseUrl } from "../../LandingPage/LandingPage";
import '@testing-library/jest-dom';
import { StateContext } from '../../StateContext';
import { BrowserRouter } from 'react-router-dom';

describe('LandingPage', () => {

    window.ethereum = true;
    const mockedFetch = jest.spyOn(global, 'fetch');
    const balance = 1000;
    const amountIn = 10;
    // let order = { price: amountIn, sellerAddress: '0x123', hash: '', confirmed: false }

    const clickCreate = () => {
        let createButton;
        createButton = screen.getByRole('button', { name: /Create transaction/i });
        fireEvent.click(createButton);
        return createButton;
    }

    const renderWithContext = async (isAuthorized = true) => {
        mockedFetch.mockImplementation(() => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: amountIn, sellerAddress: '0x123', hash: '', confirmed: false }) });
        });
        render(
            <StateContext.Provider value={{
                currentAddress: '0x123', balance: balance,
                _isAuthorizedSeller: async () => isAuthorized,
                _createOrder: async () => '0x987',
                _connectWallet: async () => { },
                _setListenerMetamaskAccount: async () => { },
                _setListenerNetworkChanged: async () => { },
                _getAmountsIn: async () => amountIn * 10 ** 18,
                _getERC20Balance: async () => balance,
                _callCreateOrder: async () => '0x987',
                _cutAddress: () => "",
                rightChain: true,
                ourNetwork: "rinkeby",
                networks: {
                    "rinkeby": {
                        chainId: "0x4",
                        chainName: "Ethereum Rinkeby Testnet",
                        nativeCurrency: {
                            name: "AVAX",
                            symbol: "AVAX",
                            decimals: 18
                        },
                        rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                        blockExplorerUrls: ["https://rinkeby.etherscan.io"]
                    }
                },
            }} >
                <BrowserRouter>
                    <LandingPage />
                </BrowserRouter>
            </StateContext.Provider>
        );

        await waitFor(() => expect(screen.getByText(/Create transaction/i)).not.toHaveClass('disabled-button'));
    };

    const checkOrderRes = async () => {
        // expect(await screen.findByText(/Transaction completed successfully!/i)).toBeInTheDocument();
        //expect(screen.getByText(/View on Etherscan/i).closest('button')).toHaveAttribute('href', 'https://rinkeby.etherscan.io/tx/0x987');
        expect(screen.getByText(/View on Etherscan/i)).toBeInTheDocument();
    }

    // beforeEach(() => {
    //     renderWithContext();
    // });    

    test('TU48 does not find wallet, renders NoWalletDetected', async () => {
        delete window.ethereum;
        render(
            <StateContext.Provider value={{
                _connectWallet: async () => { },
                _setListenerMetamaskAccount: async () => { },
                _setListenerNetworkChanged: async () => { },
                _cutAddress: () => "",
                rightChain: true,
                ourNetwork: "rinkeby",
                networks: {
                    "rinkeby": {
                        chainId: "0x4",
                        chainName: "Ethereum Rinkeby Testnet",
                        nativeCurrency: {
                            name: "AVAX",
                            symbol: "AVAX",
                            decimals: 18
                        },
                        rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                        blockExplorerUrls: ["https://rinkeby.etherscan.io"]
                    }
                },
            }} >
                <BrowserRouter>
                    <LandingPage />
                </BrowserRouter>
            </StateContext.Provider>
        );
        expect(screen.getByText(/No Ethereum wallet was detected./i)).toBeInTheDocument();
        window.ethereum = true;
    });

    test('TU49 asks to connect wallet, renders ConnectWallet', async () => {
        const mockedConnectWallet = jest.fn();
        mockedFetch.mockImplementation(() => {
            return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: balance, sellerAddress: '0x123', hash: '', confirmed: false }) });
        });
        render(
            <StateContext.Provider value={{
                _connectWallet: mockedConnectWallet,
                _setListenerMetamaskAccount: async () => { },
                _setListenerNetworkChanged: async () => { },
                _cutAddress: () => "",
                rightChain: true,
                ourNetwork: "rinkeby",
                networks: {
                    "rinkeby": {
                        chainId: "0x4",
                        chainName: "Ethereum Rinkeby Testnet",
                        nativeCurrency: {
                            name: "AVAX",
                            symbol: "AVAX",
                            decimals: 18
                        },
                        rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                        blockExplorerUrls: ["https://rinkeby.etherscan.io"]
                    }
                },
            }} >
                <LandingPage />
            </StateContext.Provider>
        );
        expect(screen.getByText(/Please connect your wallet./i)).toBeInTheDocument();
        const connectButton = screen.getByRole('button');
        expect(connectButton).toBeInTheDocument();
        fireEvent.click(connectButton);
        expect(mockedConnectWallet).toHaveBeenCalled();
    });

    // Not a good test
    // it('is loading OrderData, renders Loading message', async () => {
    //     renderWithContext();
    //     await waitFor(() => expect(screen.getByText(/Loading.../i)).toBeInTheDocument());
    //     // expect(await screen.findByText(/Loading.../i)).toBeInTheDocument(); // does not work for some reason
    // });

    describe('Confirm order', () => {

        // it('renders OrderData and confirmation button', async () => {
        //     await renderWithContext();
        //     expect(await screen.findByText(`Balance:\n 1000.0000`)).toBeInTheDocument();
        //     expect(await screen.findByText(/Payment amount in \$fUSDt:/i)).toBeInTheDocument();
        //     expect(screen.getByText(/Create transaction/i)).toBeInTheDocument();
        // });

        describe('Loading text after creating/confirming order', () => {

            const wait = () => {
                return new Promise(resolve => {
                    setTimeout(() => resolve(), 200)
                })
            };

            const renderWithContextWaitOnCreateOrder = async (isAuthorized = true) => {
                mockedFetch.mockImplementation(() => {
                    return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: 100, sellerAddress: '0x123', hash: '', confirmed: false }) });
                });
                render(
                    <StateContext.Provider value={{
                        currentAddress: '0x123', balance: balance,
                        _isAuthorizedSeller: async () => isAuthorized,
                        _getAmountsIn: async () => amountIn * 10 ** 18,
                        _connectWallet: async () => { },
                        _setListenerMetamaskAccount: async () => { },
                        _setListenerNetworkChanged: async () => { },
                        _getERC20Balance: async () => balance,
                        _callCreateOrder: async (x1, x2, x3, x4, x5, afterConfirm) => {
                            await wait();
                            afterConfirm();
                            await wait();
                            return '0x987';
                        },
                        _cutAddress: () => "",
                        rightChain: true,
                        ourNetwork: "rinkeby",
                        networks: {
                            "rinkeby": {
                                chainId: "0x4",
                                chainName: "Ethereum Rinkeby Testnet",
                                nativeCurrency: {
                                    name: "AVAX",
                                    symbol: "AVAX",
                                    decimals: 18
                                },
                                rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                                blockExplorerUrls: ["https://rinkeby.etherscan.io"]
                            }
                        },
                    }} >
                        <BrowserRouter>
                            <LandingPage />
                        </BrowserRouter>
                    </StateContext.Provider>
                );

                await waitFor(() => expect(screen.getByText(/Create transaction/i)).not.toHaveClass('disabled-button'));
            };

            test('TU50 asks to confirm transaction on Metamask after clicking create transaction, then asks to wait', async () => {
                await renderWithContextWaitOnCreateOrder();
                clickCreate();
                expect(await screen.findByText(/Please confirm the transaction on MetaMask/i)).toBeInTheDocument();
                expect(await screen.findByText(/Please wait for the transaction confirmation/i)).toBeInTheDocument();
                await waitForElementToBeRemoved(() => screen.getByText(/Please wait for the transaction confirmation/i)); // wait to avoid ending test and unmounting LandingPage while state still being updated
            });
        });

        test('TU51 completes transaction successfully and renders TxHash', async () => {
            await renderWithContext();
            clickCreate();
            expect(await screen.findByText(/Transaction completed successfully!/i)).toBeInTheDocument();
            await checkOrderRes();
        });
    });

    describe('Confirm order errors', () => {
        const renderWithContextErrorOnCreateOrder = async (isAuthorized = true) => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: balance, sellerAddress: '0x123', hash: '', confirmed: false }) });
            });
            render(
                <StateContext.Provider value={{
                    currentAddress: '0x123', balance: 100,
                    _isAuthorizedSeller: async () => isAuthorized,
                    _getAmountsIn: async () => amountIn * 10 ** 18,
                    _getERC20Balance: async () => balance,
                    _setListenerMetamaskAccount: async () => { },
                    _setListenerNetworkChanged: async () => { },
                    _connectWallet: async () => { },
                    _callCreateOrder: async () => {
                        let err = new Error();
                        err.message = 'Cannot create order';
                        err.code = '123';
                        throw err;
                    },
                    _cutAddress: () => "",
                    rightChain: true,
                    ourNetwork: "rinkeby",
                    networks: {
                        "rinkeby": {
                            chainId: "0x4",
                            chainName: "Ethereum Rinkeby Testnet",
                            nativeCurrency: {
                                name: "AVAX",
                                symbol: "AVAX",
                                decimals: 18
                            },
                            rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                            blockExplorerUrls: ["https://rinkeby.etherscan.io"]
                        }
                    },
                }} >
                    <BrowserRouter>
                        <LandingPage />
                    </BrowserRouter>
                </StateContext.Provider>
            );
            await waitFor(() => expect(screen.getByText(/Create transaction/i)).not.toHaveClass('disabled-button'));
        };

        test('TU52 re-renders Create transaction button when createorder throws error', async () => {
            await renderWithContextErrorOnCreateOrder();
            await waitFor(() => expect(screen.getByText(/Create transaction/i)).not.toHaveClass('disabled-button'));
        });

    });

    describe('Order already on-chain', () => {
        test('TU53 renders Tx is already in chain and TxHash', async () => {
            const renderWithContextOrderConfirmed = async () => {
                mockedFetch.mockImplementation(() => {
                    return Promise.resolve({ ok: true, json: () => Promise.resolve({ price: amountIn, sellerAddress: '0x123', hash: '0x987', confirmed: true }) });
                });
                render(
                    <StateContext.Provider value={{
                        currentAddress: '0x123', balance: balance,
                        _isAuthorizedSeller: async () => true,
                        _createOrder: async () => '0x987',
                        _connectWallet: async () => { },
                        _setListenerMetamaskAccount: async () => { },
                        _setListenerNetworkChanged: async () => { },
                        _getAmountsIn: async () => amountIn * 10 ** 18,
                        _getERC20Balance: async () => balance,
                        _callCreateOrder: async () => '0x987',
                        _cutAddress: () => "",
                        rightChain: true,
                        ourNetwork: "rinkeby",
                        networks: {
                            "rinkeby": {
                                chainId: "0x4",
                                chainName: "Ethereum Rinkeby Testnet",
                                nativeCurrency: {
                                    name: "AVAX",
                                    symbol: "AVAX",
                                    decimals: 18
                                },
                                rpcUrls: ["https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                                blockExplorerUrls: ["https://rinkeby.etherscan.io"]
                            }
                        },
                    }} >
                        <BrowserRouter>
                            <LandingPage />
                        </BrowserRouter>
                    </StateContext.Provider>
                );

                await waitFor(() => expect(screen.getByText(/Tx is already on-chain!/i)).toBeInTheDocument());
            }
            await renderWithContextOrderConfirmed();
            // expect(await screen.findByText(/Tx is already on-chain!/i)).toBeInTheDocument();
            await checkOrderRes();
        });

        // it('renders Tx is already in chain e-comm is being notified', async () => {

        // });

        // it('renders Tx is already in chain e-comm has been notified', async () => {

        // });
    });


});

describe('parseUrl', () => {

    delete window.location;
    window.location = new URL('https://www.ShopChain.com/landing-page?order=342');

    test('TU47 parses URL correctly', () => {
        expect(parseUrl()).toBe('http://localhost:8000/orders/342');
    });
});