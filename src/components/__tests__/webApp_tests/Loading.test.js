import { render, screen } from "@testing-library/react"
import { Loading } from "../../Loading";

test("TU04 visualizzazione pagina caricamento", ()=>{
    render(<Loading></Loading>);
    expect(screen.getByText("Loading..."));
})