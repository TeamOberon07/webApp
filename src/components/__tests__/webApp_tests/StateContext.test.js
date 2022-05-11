import { render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import { StateContext, StateProvider } from '../../StateContext';
import {expect} from 'chai';
import React from 'react';

describe('StateContext', () => {
    it('renders StateContext', async () => {  

        let sut = <StateContext.Provider value={ {
              
            _connectWallet: ()=>{ return true}
            
        }}>

        </StateContext.Provider>

        render(sut);

        
        expect(sut.prototype.state._connectWallet).equals(true);
    });
});

