// import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
// import { LandingPage, parseUrl } from "../../LandingPage/LandingPage";
// import '@testing-library/jest-dom';
// import { StateContext } from '../../StateContext';
// import { wait } from '@testing-library/user-event/dist/utils';

// // you CAN NOT unit test landingpage with RTL, it is supposed to test mimicking user interaction.
// // landingpage => integration test

// // jest.mock('../../NoWalletDetected', () => {
// //     return {
// //         NoWalletDetected: () => <p>NoWalletDetectedMock</p>
// //     }
// // });

// // jest.mock('../../ConnectWallet', () => {
// //     return {
// //         ConnectWallet: () => <p>ConnectWalletMock</p>
// //     }
// // });

// // jest.mock('../../Loading', () => {
// //     return {
// //         Loading: ({text}) => <p>{text ? text : 'Loading...'}</p>
// //     }
// // });

// // jest.mock('../../LandingPage/UserData', () => {
// //     return {
// //         UserData: () => <p>UserData</p>
// //     }
// // });

// // jest.mock('../../LandingPage/useFetch', () => {
// //     return {
// //         useFetch: (url, method, setHasNotified, setError) => {

// //         }
// //     }
// // });

// describe('LandingPage', () => {

//     window.ethereum = true;
//     const mockedFetch = jest.spyOn(global, 'fetch');

//     const clickCreate = () => {
//         const confirmButton = screen.getByRole('button');
//         fireEvent.click(confirmButton);
//         return confirmButton;
//     }

//     beforeEach(() => {
//         mockedFetch.mockImplementation(() => {
//             return Promise.resolve({ json: () => Promise.resolve({price: 100, sellerAddress: '0x123', hash: '', confirmed: false}) });
//         });
//         act(() => {
//             render(
//                 <StateContext.Provider value={ {currentAddress: '0x123', balance: 100} } >
//                     <LandingPage />
//                 </StateContext.Provider>
//             );
//         });
//     });    
    
//     // it('does not find wallet, renders NoWalletDetected', async () => {
//     //     expect(screen.getByText(/NoWalletDetectedMock/i)).toBeInTheDocument();
//     // });

//     it('asks to connect wallet, renders ConnectWallet', async () => {
//         mockedFetch.mockImplementation(() => {
//             return Promise.resolve({ json: () => Promise.resolve({price: 100, sellerAddress: '0x123', hash: '', confirmed: false}) });
//         });
//         render(
//             <StateContext.Provider value={ {} } >
//                 <LandingPage />
//             </StateContext.Provider>
//         );
//         await waitFor(() => expect(screen.getByText(/Please connect your wallet./i)).toBeInTheDocument());
//         expect(screen.getByText(/Connect wallet./i)).toBeInTheDocument();
//     });

//     it('is waiting for OrderData, renders UserData and Loading', async () => {
//         mockedFetch.mockImplementation(() => {
//             return Promise.resolve({ json: () => Promise.resolve({price: 100, sellerAddress: '0x123', hash: '', confirmed: false}) });
//         });
//         await waitFor(() => expect(screen.getByText(/Current address:/i)).toBeInTheDocument());
//         expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
//     });

//     // it('get succesful response, renders OrderData', async () => {
//     //     mockedFetch.mockImplementation(() => {
//     //         return Promise.resolve({ json: () => Promise.resolve({price: 100, sellerAddress: '0x123', hash: '', confirmed: false}) });
//     //     });

//     //     await waitFor(() => expect(screen.getByText(/Price.../i)).toBeInTheDocument());
//     //     expect(screen.getByText(/UserData/i)).toBeInTheDocument();
//     // });
// });

// describe('parseUrl', () => {

//     delete window.location;
//     window.location = new URL('https://www.ShopChain.com/landingpage?order=342');
    
//     it('parses URL correctrly', () => {
//         expect(parseUrl()).toBe('http://localhost:8000/orders/342');
//     });
// });