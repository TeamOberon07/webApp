import { render, screen } from "@testing-library/react"
import { SwitchNetwork } from "../../SwitchNetwork";
import '@testing-library/jest-dom';

test("TUx visualizzazione landing page (switch network)", ()=>{
    render(<SwitchNetwork></SwitchNetwork>);
    expect(screen.getByText(/Switch Network/i).closest('button')).toBeEnabled();
})
