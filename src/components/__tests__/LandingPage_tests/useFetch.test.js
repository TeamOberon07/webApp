import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useFetch, isValidAmount } from '../../LandingPage/useFetch';
import '@testing-library/jest-dom';
import { StateContext, StateProvider } from '../../StateContext';
import { __esModule } from '@testing-library/jest-dom/dist/matchers';

// jest.mock('../../LandingPage/useFetch', () => {
//     const originalModule = jest.requireActual('../../LandingPage/useFetch');
// return {
//     __esModule: true,
//     ...originalModule,
//     isValidAmount: jest.fn()
// }
// });


describe('useFetch', () => {

    let url = 'e-comm.com/data/1';
    let method = '';
    let mockedSetHasNotified = jest.fn();
    let mockedSetError = jest.fn();
    const mockedFetch = jest.spyOn(global, 'fetch');
    const unconfirmedOrder = {price: 10, sellerAddress: '0x123', hash: '', confirmed: false};
    const confimedOrder = {price: 10, sellerAddress: '0x123', hash:'0x987', confirmed: true};

    describe('Test fetchOptions', () => {

        const abortC = new AbortController();

        const getOptions = {
            signal: abortC.signal
        };

        const order = '';
        const putOptions = { 
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
            signal: abortC.signal
        };

        afterAll(() => {
            method = '';
        });

        beforeEach(() => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ json: () => Promise.resolve(unconfirmedOrder) });
            });
        });

        test('TU37 calls fetch with correct GET options', async () => {
            method = 'GET';
            const { waitForNextUpdate } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            await waitForNextUpdate();
            expect(mockedFetch).toHaveBeenLastCalledWith(url, getOptions);
        });

        test('TU38 calls fetch with correct PUT options', async () => {
            method = 'PUT';
            const { waitForNextUpdate } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            await waitForNextUpdate();
            expect(mockedFetch).toHaveBeenLastCalledWith(url, putOptions);
        });
    });

    describe('Test "GET" method', () => {

        beforeAll(() => {
            method='GET';
        });

        afterAll(() => {
            method = '';
        });

        beforeEach(() => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: true,  json: () => Promise.resolve({}) });
            });
        });

        describe('Test checkOrder', () => {

            beforeEach(() => {
                mockedFetch.mockImplementation(() => {
                    return Promise.resolve({ ok: true, json: () => Promise.resolve(unconfirmedOrder) });
                });
            });

            const isAuthorizedWrapper = ({children}) => (
                <StateContext.Provider value={ {_isAuthorizedSeller: async () => true } } >
                    { children }
                </StateContext.Provider>
            );
            const isNotAuthorizedWrapper = ({children}) => (
                <StateContext.Provider value={ {_isAuthorizedSeller: async () => false } } >
                    { children }
                </StateContext.Provider>
            );
            const isAuthorizedErrorWrapper = ({children}) => (
                <StateContext.Provider value={ {_isAuthorizedSeller: async () => {throw "Error: can't connect";} } } >
                    { children }
                </StateContext.Provider>
            );

            test('TU39 calls setOrder and setIsloaded when GET request OK and order is valid', async () => {
                const { result } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError), { wrapper: isAuthorizedWrapper });
                await waitFor(() => expect(result.current[1]).toBe(true));
                expect(result.current[0]).toStrictEqual(unconfirmedOrder);
            });

            test('TU40 calls setError when GET request OK but seller is not authorized', async () => {
                const { result } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError), { wrapper: isNotAuthorizedWrapper });
                await waitFor(() => expect(result.current[1]).toBe(true));
                expect(mockedSetError).toHaveBeenLastCalledWith('Seller Address not recognized (Address: ' + unconfirmedOrder.sellerAddress + ')');
            });

            test('TU41 calls setError when GET request OK but price is invalid', async () => {
                mockedFetch.mockImplementation(() => {
                    return Promise.resolve({ ok: true, json: () => Promise.resolve({price: 'price', sellerAddress: '0x123', hash: '', confirmed: false}) });
                });
                const { result } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError), { wrapper: isAuthorizedWrapper });
                await waitFor(() => expect(result.current[1]).toBe(true));
                expect(mockedSetError).toHaveBeenLastCalledWith('Invalid price format (price: price)');
            });

            test('TU42 calls setError when GET request OK but isAuthorizedSeller throws an error', async () => {
                const { result } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError), { wrapper: isAuthorizedErrorWrapper });
                await waitFor(() => expect(result.current[1]).toBe(true));
                expect(mockedSetError).toHaveBeenLastCalledWith("Error: can't connect");
            });
        });
   
        test('TU43 recieves !ok response from fetch and calls setError with code and statusText as recieved', async () => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: false, status:404, statusText: 'Not Found',  json: () => Promise.resolve({}) });
            });
            const { waitForNextUpdate } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            await waitForNextUpdate();
            expect(mockedSetError).toHaveBeenLastCalledWith(`${method} request failed (Code 404: Not Found)`);
        });

        test('TU44 realizes that order is alrady in chain and calls setOrder, setError, setIsLoaded', async () => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: true, json: () => Promise.resolve(confimedOrder) });
            });
            const { result, waitForNextUpdate } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            //await waitFor(() => expect(result.current[1]).toBe(true));
            await waitForNextUpdate();
            expect(result.current[0]).toStrictEqual(confimedOrder);
            expect(mockedSetError).toHaveBeenLastCalledWith('Order on-chain');
            expect(result.current[1]).toBe(true);
        });

        // it('realizes that order is alrady in chain but E-comm has not been notified, calls setOrder, setError ( with "Order in chain & !notified"), setIsLoaded', async () => {

        // });
    });

    describe('Test "PUT" method', () => {

        beforeAll(() => {
            method='PUT';
        });

        afterAll(() => {
            method = '';
        });

        beforeEach(() => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: true,  json: () => Promise.resolve({}) });
            });
        });

        test('TU45 calls setHashNotified when PUT request OK', async () => {
            renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            await waitFor(() => expect(mockedSetHasNotified).toHaveBeenCalled());
        });
    });

    describe('Abort error', () => {

        const mockedAbort = jest.spyOn(AbortController.prototype, 'abort');

        beforeAll(() => {
            method='GET';
        });

        afterAll(() => {
            method = '';
            mockedAbort.mockRestore();
        });

        beforeEach(() => {
            mockedFetch.mockRestore();
        });

        test('TU46 identifies AbortError and does not call setError', () => {
            const { unmount } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            unmount();
            expect(mockedSetError).not.toHaveBeenCalled();
            expect(mockedAbort).toHaveBeenCalled();
        });
    });

});

describe('isValidAmount', () => {

    test('TU36 isValidAmount behaviour', () => {
        expect(isValidAmount(1.5)).toStrictEqual(true);
        expect(isValidAmount('no')).toStrictEqual(false);
        expect(isValidAmount('10-.1')).toStrictEqual(false);
        expect(isValidAmount(-1)).toStrictEqual(false);
        expect(isValidAmount(0)).toStrictEqual(false);
    });

    // test('not a number is not a valid amount', () => {

    // });
});