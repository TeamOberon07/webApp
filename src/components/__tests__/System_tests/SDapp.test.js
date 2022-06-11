const puppeteer = require("puppeteer");
const dappeteer = require("@chainsafe/dappeteer");
const { exec } = require('child_process')
const { ethers } = require("ethers");
let abi = require("../../../contracts/SCEscrow.json");
abi = abi.abi;

let browser, metamask, page, ecommercePage, landingPage, orderPage, registerSellerPage
// BE SURE THESE 2 ACCOUNTS HAVE FUNDS, ALSO BUYER MUST HAVE STABLECOIN/JOE TO CREATE ORDERS
const buyer1 = "f603a29a26ccc992cc66b2a871239f558e1d8fdde46134a6a62afbc87f60f2f0"
const seller1 = "ae17644f94057fe74c4dd000b0f3594779bb05fc69b7edaabc34be2a77b08456"
const contractAddress = "0xCB99efB19481eF91F3296a6E6a61caA7F02Af65D"
// INSERT HERE A NEW PRIVATE KEY!!!
// Create a new account on metamask, then go to the faucet and request funds, otherwise the last test (TS10) will fail
const pkRegisterSeller = "4ec3db633ce43930ceb42b9c6d0279b5397c8a732d8c40faab3eae2a6182c85b"

jest.setTimeout(5000000);

function timeout(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function getCurrentPage() {
    let page = await browser.targets()[browser.targets().length-1].page();
    return page
}

async function clickElement(page, selector) {
    await page.bringToFront();
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    await element.click();
}

async function confirm() {
    let newPage = await browser.newPage();
    await newPage.goto('chrome-extension://bapankfikpfilkalmgmfmlaninppnahk/home.html#');
    await timeout(4000)
    await metamask.confirmTransaction();
    await newPage.close()
}

async function init() {
    exec('pkill chrome');
    browser = await dappeteer.launch(
        puppeteer, 
        {
            metamaskVersion: 'v10.8.1', 
            defaultViewport: null,
        }
    );
    metamask = await dappeteer.setupMetamask(
    browser, 
    { 
        seed: "bus chaos length argue powder parrot exotic stove anger just now else", 
        password: "provaprova",
        showTestNets: true
    }
    );

    await metamask.importPK(buyer1);
    await metamask.switchAccount(2);
    await metamask.switchNetwork('rinkeby');
}

async function connectWallet() {
    page = await browser.newPage()
    await page.goto('http://localhost:3000')
    await timeout(3000)
    await clickElement(page, '.cta-button');
    await metamask.approve()
    await page.bringToFront()
    await timeout(3000)
    await page.close()
}

async function openLandingFromEcommerce() {
    ecommercePage = await browser.newPage()
    await ecommercePage.goto('http://localhost:3001')

    // INSERT PRICE
    await ecommercePage.waitForSelector('input[name=price]');
    await ecommercePage.focus('input[name=price]')
    ecommercePage.keyboard.type('0.1')
    await timeout(1000)

    // INSERT WALLET ADDRESS
    const wallet = new ethers.Wallet(buyer1)
    const address = wallet.address;
    await ecommercePage.waitForSelector('input[name=buyerAddress]');
    await ecommercePage.focus('input[name=buyerAddress]')
    ecommercePage.keyboard.type(address)
    await timeout(1000)

    // CLICK SUBMIT
    await ecommercePage.evaluate(() => {
        document.querySelector('input[type=submit]').click();
    });
    await timeout(3000)
}

async function emulateOrderConfirmation() {
    async function createOrder_AVAX(orderAmount, msg_value, buyer, seller) {
        orderAmount = ethers.utils.parseEther(orderAmount.toString());
        msg_value = ethers.utils.parseEther(msg_value.toString());
        let tx = await contract.connect(buyer).createOrderWithAVAXToStable(
            seller.address, 
            orderAmount, 
            {value: msg_value}
        );
        console.log("Creating order...")
        await tx.wait()
        console.log("Order created.")
    }

    let provider = new ethers.providers.JsonRpcProvider("https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");
    let buyer1wallet = new ethers.Wallet(buyer1, provider);
    let seller1wallet = new ethers.Wallet(seller1, provider);
    let contract = new ethers.Contract(contractAddress, abi, buyer1wallet);

    await createOrder_AVAX(0.1, 0.1, buyer1wallet, seller1wallet);
    
    let lastOrder = await contract.getTotalOrders();
    lastOrder = parseInt(lastOrder) - 1

    let tx = await contract.connect(seller1wallet).shipOrder(lastOrder);
    console.log("Shipping order...")
    await tx.wait()
    console.log("Order shipped.")
    tx = await contract.connect(buyer1wallet).confirmOrder(lastOrder);
    console.log("Scanning QRCode...")
    await tx.wait();
    console.log("Order confirmed.")
}

describe('System tests - Landing Page', () => {

    let firstTime = true;

    beforeEach(async () => {
        if (firstTime) {
            firstTime = false
            await init();
            await connectWallet();
        }
        await openLandingFromEcommerce();
    })

    test("TS01 - Buyer può comprare con AVAX", async () => {

        landingPage = await getCurrentPage()
        await timeout(3000)
        await clickElement(landingPage, '#createOrder')
        await confirm()
        await landingPage.bringToFront()
        await timeout(30000)
        const confirmation = await landingPage.$("#transaction-ok");
        const text = await confirmation.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBeDefined();

    });

    test("TS02 - Buyer può comprare con la stablecoin", async () => {
        landingPage = await getCurrentPage()
        await timeout(3000)
        await clickElement(landingPage, '.select-button')
        await timeout(1500)
        await clickElement(landingPage, 'body > div.MuiModal-root.MuiDialog-root.css-zw3mfo-MuiModal-root-MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper.css-hz1bth-MuiDialog-container > div > ul > li:nth-child(5)')
        await timeout(3000)
        // APPROVE
        await clickElement(landingPage, '.cta-button.basic-button.blur-light')
        await confirm()
        await landingPage.bringToFront()
        await timeout(30000)
        // CREATE ORDER
        await clickElement(landingPage, '.cta-button.basic-button.blur-light')
        await confirm()
        await landingPage.bringToFront()
        await timeout(30000)
        // CHECK CONFIRMATION
        const confirmation = await landingPage.$("#transaction-ok");
        const text = await confirmation.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBeDefined();
    });  

    test("TS03 - Buyer può comprare con un token qualsiasi", async () => {
        landingPage = await getCurrentPage()
        await timeout(3000)
        await clickElement(landingPage, '.select-button')
        await timeout(1500)
        await clickElement(landingPage, 'body > div.MuiModal-root.MuiDialog-root.css-zw3mfo-MuiModal-root-MuiDialog-root > div.MuiDialog-container.MuiDialog-scrollPaper.css-hz1bth-MuiDialog-container > div > ul > li:nth-child(2)')
        await timeout(3000)
        // APPROVE
        await clickElement(landingPage, '.cta-button.basic-button.blur-light')
        await confirm()
        await landingPage.bringToFront()
        await timeout(30000)
        // CREATE ORDER
        await clickElement(landingPage, '.cta-button.basic-button.blur-light')
        await confirm()
        await landingPage.bringToFront()
        await timeout(30000)
        // CHECK CONFIRMATION
        const confirmation = await landingPage.$("#transaction-ok");
        const text = await confirmation.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBeDefined();
        landingPage.close();
    });   
});

describe('System tests - Order Page', () => {

    let firstTime = true;

    beforeEach(async () => {
        if (firstTime) {
            firstTime = false
            await init();
            await connectWallet();
            orderPage = await browser.newPage()
            await orderPage.goto('http://localhost:3000')
        }
    })

    test("TS04 - Buyer può chiedere rimborso dopo aver comprato", async () => {
        await timeout(3000)
        // click See order
        await clickElement(orderPage, '#root > div > div > div > table > tbody > tr:nth-child(1) > td.order-button-cell > a')
        await timeout(1000)
        // click Ask refund
        await clickElement(orderPage, '#order-page-container > tbody > tr:nth-child(5) > td > div > button')
        await confirm()
        await orderPage.bringToFront()
        await timeout(30000)
        const orderState = await orderPage.$("#order-page-container > tbody > tr:nth-child(4) > td");
        const text = await orderState.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Refunded");
    });

    test("TS05 - Seller può settare lo stato Shipped", async () => {
        // BEGIN SWITCHING ACCOUNT
        await metamask.importPK(seller1);
        await metamask.switchAccount(2);
        await clickElement(metamask.page, "#app-content > div > div.main-container-wrapper > div > div > div > div.menu-bar > button")
        await timeout(500)
        await clickElement(metamask.page, "#popover-content > div.menu__container.account-options-menu > button:nth-child(4)")
        await timeout(500)
        await clickElement(metamask.page, "#app-content > div > span > div.modal > div > div > div.modal-container__footer > button.button.btn--rounded.btn-primary.modal-container__footer-button")
        await timeout(500)
        await metamask.switchAccount(2)
        await orderPage.bringToFront()
        await orderPage.reload()
        await connectWallet()
        await orderPage.reload()
        await orderPage.bringToFront()
        await orderPage.goto('http://localhost:3000')
        // END SWITCHING ACCOUNT
        // click See order
        await clickElement(orderPage, '#root > div > div > div > table > tbody > tr:nth-child(2) > td.order-button-cell > a')
        await timeout(1000)
        // click Mark as Shipped
        await clickElement(orderPage, '#order-page-container > tbody > tr:nth-child(5) > td > div > button:nth-child(2)')
        await confirm()
        await orderPage.bringToFront()
        await timeout(35000)
        const orderState = await orderPage.$("#order-page-container > tbody > tr:nth-child(4) > td");
        const text = await orderState.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Shipped");
    });

    test("TS06 - Seller può cancellare ordine settato a Shipped", async () => {
        // click Delete
        await clickElement(orderPage, '#order-page-container > tbody > tr:nth-child(5) > td > div > button')
        await confirm()
        await orderPage.bringToFront()
        await timeout(35000)
        const orderState = await orderPage.$("#order-page-container > tbody > tr:nth-child(4) > td");
        const text = await orderState.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Deleted");
    });

    test("TS07 - Seller può cancellare ordine settato a Created", async () => {
        await orderPage.goto("http://localhost:3000")
        // click See order
        await clickElement(orderPage, '#root > div > div > div > table > tbody > tr:nth-child(3) > td.order-button-cell > a')
        await timeout(5000)
        // click Delete
        await clickElement(orderPage, '#order-page-container > tbody > tr:nth-child(5) > td > div > button:nth-child(1)')
        await confirm()
        await orderPage.bringToFront()
        await timeout(35000)
        const orderState = await orderPage.$("#order-page-container > tbody > tr:nth-child(4) > td");
        const text = await orderState.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Deleted");
    });

    test("TS08 - Buyer può chidere rimborso di un ordine Confirmed", async () => {
        // BEGIN SWITCHING ACCOUNT
        await metamask.importPK(buyer1);
        await metamask.switchAccount(2);
        await clickElement(metamask.page, "#app-content > div > div.main-container-wrapper > div > div > div > div.menu-bar > button")
        await timeout(500)
        await clickElement(metamask.page, "#popover-content > div.menu__container.account-options-menu > button:nth-child(4)")
        await timeout(500)
        await clickElement(metamask.page, "#app-content > div > span > div.modal > div > div > div.modal-container__footer > button.button.btn--rounded.btn-primary.modal-container__footer-button")
        await timeout(500)
        await metamask.switchAccount(2)
        await orderPage.bringToFront()
        await orderPage.reload()
        await connectWallet()
        await orderPage.reload()
        await orderPage.bringToFront()
        await orderPage.goto('http://localhost:3000')
        // END SWITCHING ACCOUNT

        // buyer scans qr code to confirm order
        await emulateOrderConfirmation()
        await orderPage.reload()

        // click See order
        await clickElement(orderPage, '#root > div > div > div > table > tbody > tr:nth-child(1) > td.order-button-cell > a')
        await timeout(1000)
        // click Ask Refund
        await clickElement(orderPage, '#order-page-container > tbody > tr:nth-child(5) > td > div > button')
        await confirm()
        await orderPage.bringToFront()
        await timeout(35000)
        const orderState = await orderPage.$("#order-page-container > tbody > tr:nth-child(4) > td");
        const text = await orderState.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Asked Refund");
    });

    test("TS09 - Seller può rimborsare l'utente", async () => {
        // BEGIN SWITCHING ACCOUNT
        await metamask.importPK(seller1);
        await metamask.switchAccount(2);
        await clickElement(metamask.page, "#app-content > div > div.main-container-wrapper > div > div > div > div.menu-bar > button")
        await timeout(500)
        await clickElement(metamask.page, "#popover-content > div.menu__container.account-options-menu > button:nth-child(4)")
        await timeout(500)
        await clickElement(metamask.page, "#app-content > div > span > div.modal > div > div > div.modal-container__footer > button.button.btn--rounded.btn-primary.modal-container__footer-button")
        await timeout(500)
        await metamask.switchAccount(2)
        await orderPage.bringToFront()
        await orderPage.reload()
        await connectWallet()
        await orderPage.reload()
        await orderPage.bringToFront()
        await orderPage.goto('http://localhost:3000')
        // END SWITCHING ACCOUNT
        // click See order
        await clickElement(orderPage, '#root > div > div > div > table > tbody > tr:nth-child(1) > td.order-button-cell > a')
        await timeout(2000)
        // click Approve
        await clickElement(orderPage, '#approve-button')
        await confirm()
        await orderPage.bringToFront()
        await timeout(35000)
        // click Refund Buyer
        await clickElement(orderPage, '#order-page-container > tbody > tr:nth-child(5) > td > div > button.cta-button.basic-button.blur-light')
        await confirm()
        await orderPage.bringToFront()
        await timeout(35000)
        // check state has changed correctly
        const orderState = await orderPage.$("#order-page-container > tbody > tr:nth-child(4) > td");
        const text = await orderState.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Refunded");
    });
})

describe('System tests - Register Seller Page', () => {

    let firstTime = true;

    beforeEach(async () => {
        if (firstTime) {
            firstTime = false
            await init();
            await connectWallet();
            registerSellerPage = await browser.newPage()
            await registerSellerPage.goto('http://localhost:3000/register-seller')
        }
    })

    test("TS10 - Un utente può registrarsi come Seller", async () => {

        // BEGIN SWITCHING ACCOUNT
        await metamask.importPK(pkRegisterSeller);
        await metamask.switchAccount(2);
        await clickElement(metamask.page, "#app-content > div > div.main-container-wrapper > div > div > div > div.menu-bar > button")
        await timeout(500)
        await clickElement(metamask.page, "#popover-content > div.menu__container.account-options-menu > button:nth-child(4)")
        await timeout(500)
        await clickElement(metamask.page, "#app-content > div > span > div.modal > div > div > div.modal-container__footer > button.button.btn--rounded.btn-primary.modal-container__footer-button")
        await timeout(500)
        await metamask.switchAccount(2)
        await registerSellerPage.bringToFront()
        await registerSellerPage.reload()
        await connectWallet()
        await registerSellerPage.reload()
        await registerSellerPage.bringToFront()
        // END SWITCHING ACCOUNT

        // click Register
        await clickElement(registerSellerPage, '.register-button')
        await confirm()
        await registerSellerPage.bringToFront()
        await timeout(30000)
        await registerSellerPage.goto('http://localhost:3000/')
        await timeout(5000)
        const tableHeader = await registerSellerPage.$("#root > div > div > div > table > thead > tr > th:nth-child(2)");
        const text = await tableHeader.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Buyer Address");
    });

});