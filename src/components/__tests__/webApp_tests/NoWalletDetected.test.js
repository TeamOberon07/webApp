import { render, screen } from "@testing-library/react"
import { NoWalletDetected } from "../../NoWalletDetected"

test("TUx visualizzazione wallet non caricato",()=>{
    render(<NoWalletDetected></NoWalletDetected>)
    let hint = screen.getByRole("hint");
    expect(hint.textContent.includes("No Ethereum wallet was detected."));
    expect(hint.textContent.includes("Please install MetaMask."));
})