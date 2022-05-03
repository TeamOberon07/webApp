import { render, screen } from "@testing-library/react"
import { ConnectWallet } from "../../ConnectWallet";
import '@testing-library/jest-dom';

test("TUx visualizzazione landing page", ()=>{
    render(<ConnectWallet></ConnectWallet>);
    expect(screen.getByText(/Connect Wallet/i).closest('button')).toBeEnabled();
})
