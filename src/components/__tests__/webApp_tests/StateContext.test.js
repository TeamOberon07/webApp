import { render, screen } from "@testing-library/react"
import { StateProvider} from "../../StateContext"
import { Header} from "../../Header"
import { BrowserRouter } from "react-router-dom";

test("Tx visualizzazione address utente", ()=>{
    render(<StateProvider/>);
})
