import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { useFetch, isValidAmount } from '../../LandingPage/useFetch';
import '@testing-library/jest-dom';

describe('useFetch', () => {

    let url = 'e-comm.com/data/1';
    let method = '';
    let mockedSetHasNotified = jest.fn();
    let mockedSetError = jest.fn();
    const mockedFetch = jest.spyOn(global, 'fetch');

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
                return Promise.resolve({ json: () => Promise.resolve({price: 100, sellerAddress: '0x123', hash: '', confirmed: false}) });
            });
        });

        it('calls fetch with correct GET options', async () => {
            method = 'GET';
            const { waitForNextUpdate } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            await waitForNextUpdate();
            expect(mockedFetch).toHaveBeenLastCalledWith(url, getOptions);
        });

        it('calls fetch with correct PUT options', async () => {
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

        // NEED to move isAuthorizedSeller to StateContext FIRST, after that checkOrder can be tested (should it even be mocked?)
        // 
        // it('calls setOrder and setIsloaded when GET request OK and order is valid', async () => {
        //     mockedFetch.mockImplementation(() => {
        //         return Promise.resolve({ ok: true, json: () => Promise.resolve({price: 10, sellerAddress: '0x123', hash:'', confirmed: false}) });
        //     });
        //     const mockedIsAuthorizedSeller = jest.fn(() => true);
        //     // jest.spyOn(StateContext, 'isAuthorizedSeller').mockImplementation(() => true);
        //     const { result } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
        //     await waitFor(() => expect(result.current[1]).toBe(true));
        //     expect(result.current[0]).toStrictEqual({price: 10, sellerAddress: '0x123', hash:'', confirmed: false});
        // });
   
        it('recieves !ok response from fetch and calls setError with code and statusText as recieved', async () => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: false, status:404, statusText: 'Not Found',  json: () => Promise.resolve({}) });
            });
            const { waitForNextUpdate } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            await waitForNextUpdate();
            expect(mockedSetError).toHaveBeenLastCalledWith(`${method} request failed (Code 404: Not Found)`);
        });

        // Devide in 3 different unit tests?
        it('realizes that order is alrady in chain and calls setOrder, setError, setIsLoaded', async () => {
            mockedFetch.mockImplementation(() => {
                return Promise.resolve({ ok: true, json: () => Promise.resolve({price: 10, sellerAddress: '0x123', hash:'0x987', confirmed: true}) });
            });
            const { result, waitForNextUpdate } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            //await waitFor(() => expect(result.current[1]).toBe(true));
            await waitForNextUpdate();
            expect(result.current[0]).toStrictEqual({price: 10, sellerAddress: '0x123', hash:'0x987', confirmed: true});
            expect(mockedSetError).toHaveBeenLastCalledWith('Order in chain');
            expect(result.current[1]).toBe(true);
        });
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

        it('calls setHashNotified when PUT request OK', async () => {
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

        it('identifies AbortError and does not call setError', () => {
            const { unmount } = renderHook(() => useFetch(url, method, mockedSetHasNotified, mockedSetError));
            unmount();
            expect(mockedSetError).not.toHaveBeenCalled();
            expect(mockedAbort).toHaveBeenCalled();
        });
    });

});

describe('isValidAmount', () => {

    it('is a valid amount', () => {
        expect(isValidAmount(1.5)).toStrictEqual(true);
    });

    it('is not a valid amount, not a number', () => {
        expect(isValidAmount('no')).toStrictEqual(false);
    });

    it('is not a valid amount, not a valid number', () => {
        expect(isValidAmount('10-.1')).toStrictEqual(false);
    });

    it('is not a valid amount, less than 0', () => {
        expect(isValidAmount(-1)).toStrictEqual(false);
    });

    it('is not a valid amount, equals 0', () => {
        expect(isValidAmount(0)).toStrictEqual(false);
    });

});