import { fireEvent,createEvent, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Orders } from "../../Orders";

window.__defineGetter__('navigator', function() {
    return {
      clipboard: {
        writeText: jest.fn(x => x)
      }
    }
})
describe('Orders', () => {
    test("TU08 visualizzazione delle transazioni (isBuyer = true)", async () => {

        let localState = ["Created", "Confirmed", "Deleted", "Asked Refund", "Refunded"];
        let mock = [
            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                0
            ]
        ];

        let orderView = <BrowserRouter><Orders orders={mock} isBuyer={true} State={localState}></Orders></BrowserRouter>
        render(orderView);
        let id = screen.getByLabelText("Id");
        let address = screen.getByLabelText("Address");
        let amount = screen.getByLabelText("Amount");
        let icon = screen.getByLabelText("Icon");

        expect(id.innerHTML === {
            "type": "BigNumber",
            "hex": "0x1a"
        })
        expect(address.innerHTML === "0xc6d8...c2ac2E");
        expect(amount.innerHTML === "0.0003");
        expect(amount.innerHTML === "Created");
    })

    test("TU09 visualizzazione delle transazioni (isBuyer = false)", async () => {

        let localState = ["Created", "Confirmed", "Deleted", "Asked Refund", "Refunded"];
        let mock = [
            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],
            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],
            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],
            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],
            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],
            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ],

            [
                {
                    "type": "BigNumber",
                    "hex": "0x1a"
                },
                "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
                "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
                "300000000000000",
                1
            ]
        ];

        let orderView = <BrowserRouter><Orders orders={mock} isBuyer={false} State={localState}></Orders></BrowserRouter>
        render(orderView);

        let FilterAddress = screen.getByRole("FilterAddress"),
            ApplyFilters = screen.getByRole("ApplyFilters"),
            FilterState = screen.getByRole("FilterState");
        fireEvent.click(screen.getAllByTestId("copyIcon")[0]);
        FilterAddress.focus();
        fireEvent.change(FilterAddress, { target: { value: '0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E' } })
        FilterAddress.blur();

        const myEvent = createEvent.click(ApplyFilters)
        myEvent.preventDefault = jest.mock();
        fireEvent.click(ApplyFilters, myEvent)

        FilterAddress.focus();
        fireEvent.change(FilterAddress, { target: { value: 'address non valido' } })
        FilterAddress.blur();

        fireEvent.change(FilterState, { target: { value: 3 } })

        fireEvent.click(ApplyFilters, myEvent)

        fireEvent.click(screen.getByRole("ResetFilters"));

        fireEvent.click(screen.getByRole("Next"));
        fireEvent.click(screen.getByRole("Previous"));
    })
})