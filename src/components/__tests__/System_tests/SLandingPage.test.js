const puppeteer = require("puppeteer");
const dappeteer = require("@chainsafe/dappeteer");
const { exec } = require('child_process')
const { ethers } = require("ethers");

let browser, metamask, page, ecommercePage, landingPage, orderPage
const buyer1 = "f603a29a26ccc992cc66b2a871239f558e1d8fdde46134a6a62afbc87f60f2f0"
const seller1 = "ae17644f94057fe74c4dd000b0f3594779bb05fc69b7edaabc34be2a77b08456"

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
    await timeout(3000)
    await metamask.confirmTransaction();
    await newPage.close()
}

async function init() {
    exec('pkill chrome');
    browser = await dappeteer.launch(puppeteer, {metamaskVersion: 'v10.8.1'});
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

    test("Buyer può comprare con AVAX", async () => {

        landingPage = await getCurrentPage()
        await timeout(3000)
        await clickElement(landingPage, '#createOrder')
        await confirm()
        await landingPage.bringToFront()
        await timeout(25000)
        const confirmation = await landingPage.$("#transaction-ok");
        const text = await confirmation.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBeDefined();

    });

    test("Buyer può comprare con la stablecoin", async () => {
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
        await timeout(25000)
        // CREATE ORDER
        await clickElement(landingPage, '.cta-button.basic-button.blur-light')
        await confirm()
        await landingPage.bringToFront()
        await timeout(25000)
        // CHECK CONFIRMATION
        const confirmation = await landingPage.$("#transaction-ok");
        const text = await confirmation.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBeDefined();
    });  

    test("Buyer può comprare con un token qualsiasi", async () => {
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
        await timeout(25000)
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
    let i = 0

    beforeEach(async () => {
        if (firstTime) {
            firstTime = false
            await init();
            await connectWallet();
            orderPage = await browser.newPage()
            await orderPage.goto('http://localhost:3000')
        }
    })

    afterEach(async () => {
        // await orderPage.close()
    })

    test("Buyer può chiedere rimborso dopo aver comprato", async () => {
        await timeout(3000)
        await clickElement(orderPage, '#root > div > div > div > table > tbody > tr:nth-child(4) > td.order-button-cell > a')
        await timeout(1500)
        await clickElement(orderPage, '#order-page-container > tbody > tr:nth-child(1) > td > div > button')
        await confirm()
        await orderPage.bringToFront()
        await timeout(30000)
        const orderState = await orderPage.$("#order-page-container > tbody > tr:nth-child(4) > td");
        const text = await orderState.getProperty('textContent');
        const value = await text.jsonValue();
        expect(value).toBe("Refunded");
    });

    test("Seller può settare lo stato shipped", async () => {
        await metamask.importPK(seller1);
        await metamask.switchAccount(3);
        await orderPage.bringToFront()
    });
})