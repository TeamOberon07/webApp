import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Orders } from "../../Orders";

test("TU11 visualizzazione delle transazioni (isBuyer = true)", ()=>{

    let localState = ["Created","Confirmed","Deleted","Asked Refund","Refunded"];
    
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

    let orderView =<BrowserRouter><Orders orders={mock} isBuyer = {true}  State={localState}></Orders></BrowserRouter>
    render(orderView);
    let id = screen.getByLabelText("Id");
    let address = screen.getByLabelText("Address");
    let amount = screen.getByLabelText("Amount");
    let icon = screen.getByLabelText("Icon");

    expect(id.innerHTML === {
        "type": "BigNumber",
        "hex": "0x1a"
    } )
    expect(address.innerHTML === "0xc6d8...c2ac2E");
    expect(amount.innerHTML === "0.0003");
    expect(amount.innerHTML === "Created");
})

test("TU11 visualizzazione delle transazioni (isBuyer = false)", ()=>{

    let localState = ["Created","Confirmed","Deleted","Asked Refund","Refunded"];
    
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
        ]
    ];

    let orderView = <BrowserRouter><Orders orders={mock} isBuyer = {false}  State={localState}></Orders></BrowserRouter>
    render(orderView);
    let id = screen.getByLabelText("Id");
    let address = screen.getByLabelText("Address");
    let amount = screen.getByLabelText("Amount");
    let icon = screen.getByLabelText("Icon");

    expect(id.innerHTML === {
        "type": "BigNumber",
        "hex": "0x1a"
    } )
    expect(address.innerHTML === "0xc6d8...c2ac2E");
    expect(amount.innerHTML === "0.0003");
    expect(amount.innerHTML === "Confirmed");
})

// test("TUx visualizzazione vista buyer", ()=>{
//     let localState = ["Created","Confirmed","Deleted","Asked Refund","Refunded"];
    
//     let mock = [
//         [
//             {
//                 "type": "BigNumber",
//                 "hex": "0x1a"
//             },
//             "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
//             "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
//             "300000000000000",
//             1
//         ]
//     ];
//     let buyerView =<BrowserRouter><Buyer currentAddress="0xe5B197D91ad002a18917aB4fdc6b6E0126797482" balance="300000000000000" seller="0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E" orders={mock} askRefund={() => {}} createOrder={() => {}} confirmOrder={() => {}} orderAmount="" getQRCode={(id) => {}} State={localState}></Buyer></BrowserRouter>

//     render(buyerView);
//     fireEvent.click(screen.getByRole('create-order'));
//     const selector = screen.getByRole('order-selector');

//     expect(selector.options[0].value === 26)
//     fireEvent.submit(screen.getByRole('refund-order'));
// })

// test("TUx visualizzazione vista seller", ()=>{
//     let localState = ["Created","Confirmed","Deleted","Asked Refund","Refunded"];
    
//     let mock = [
//         [
//             {
//                 "type": "BigNumber",
//                 "hex": "0x1a"
//             },
//             "0xe5B197D91ad002a18917aB4fdc6b6E0126797482",
//             "0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E",
//             "300000000000000",
//             1
//         ]
//     ];
//     let sellerView =<Seller currentAddress="0xe5B197D91ad002a18917aB4fdc6b6E0126797482" balance="300000000000000" seller="0xc6d8fEFc59868633e04b8DE3D7c69CbE92c2ac2E" orders={mock} deleteOrder={() => {}} refundBuyer={() => {}} orderAmount="" getQRCode={()=>{}} State={localState}></Seller>

//     render(sellerView);
//     const selectRefund= screen.getByRole('refund-select');
//     // Da finire di testare
//     // let option = document.createElement("option");
//     // option.value = option.text = "26";
//     // selectRefund.appendChild(option);
//     let formRefund=screen.getByRole('refund-order');
//     // formRefund.setState({value:26});
//     fireEvent.submit(formRefund);
//     fireEvent.submit(screen.getByRole('delete-order'));
//     fireEvent.submit(screen.getByRole('qr-order'));
//     // const selector = screen.getByRole('order-selector');

//     // expect(selector.options[0].value === 26)
//     // fireEvent.submit(screen.getByRole('refund-order'));
// })