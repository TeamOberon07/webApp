import { render, screen } from '@testing-library/react';
import { UserData } from '../../LandingPage/UserData';
import { StateContext } from '../../StateContext';
import '@testing-library/jest-dom';


describe('UserData', () => {

    const renderUserData = () => {
        render(
            <StateContext.Provider value={ {currentAddress: '0x123', balance: 100} } >
                <UserData />
            </StateContext.Provider>
        );
    };
    
    it('renders user address', () => {
        renderUserData();
        expect(screen.getByText(/Current address: 0x123/i)).toBeInTheDocument();
    });

    it('renders amount held by user', () => {
        renderUserData();
        expect(screen.getByText(/Current balance: 100/i)).toBeInTheDocument();
    });
});