import { render, screen } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom";
import { Header } from "../../Header"

test("visualizzazione address utente", ()=>{
    render(<BrowserRouter><Header currentAddress ="0xe5B197D91ad002a18917aB4fdc6b6E0126797482" ></Header></BrowserRouter>);
    expect(screen.getByText("0xe5B1...797482"));
})
