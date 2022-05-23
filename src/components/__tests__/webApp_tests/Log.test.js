import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StateContext } from '../../StateContext';
import { Log } from '../../Log';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

describe('Log', () => {
    test('TU05 renders Log with correct data', async () => {  

        render(<StateContext.Provider  value={ {
          orderState: ['Created', 'Shipped', 'Confirmed', 'Deleted', 'Asked Refund', 'Refunded'],
              _getLog: async (id) => Promise.resolve([[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]) 
            }} >
                <BrowserRouter>
                  <Log order = {[[0,1652118547],[1,1652118547],[2,1652118547],[3,1652118547],[4,1652118547],[5,1652118547],[6,1652118547]]}></Log>
                </BrowserRouter>
              </StateContext.Provider>)

      let table = await screen.findByRole("logTable");
      expect(table.innerHTML.includes("Created"));
      expect(table.innerHTML.includes("Shipped"));
      expect(table.innerHTML.includes("Confirmed"));
      expect(table.innerHTML.includes("Deleted"));
      expect(table.innerHTML.includes("Refund Asked"));
      expect(table.innerHTML.includes("Refunded"));
      expect(table.innerHTML.includes("Errore"));

      expect(table.innerHTML.includes("9/5/2022 19:49"));

    });
});