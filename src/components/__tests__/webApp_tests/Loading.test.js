import { render, screen } from "@testing-library/react"
import { Loading } from "../../Loading";

test("TUx visualizzazione pagina caricamento", ()=>{
    render(<Loading></Loading>);
    expect(screen.getByText("Loading..."));
})
