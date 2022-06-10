const puppeteer = require("puppeteer");
const dappeteer = require("@chainsafe/dappeteer");
const { exec } = require('child_process')
const { ethers } = require("ethers");

let browser, metamask;
// BUYER 1 pvtKey
const pvtKey = "f603a29a26ccc992cc66b2a871239f558e1d8fdde46134a6a62afbc87f60f2f0";

jest.setTimeout(5000000);

function timeout(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

  await metamask.importPK(pvtKey);
  await metamask.switchAccount(2);
  await metamask.switchNetwork('rinkeby');
}

describe('Integration tests', () => {

  let firstTime = true;
  let page;

  beforeEach(async () => {
    if (firstTime) {
      firstTime = false
      await init();
    }
    page = await browser.newPage()
    await page.goto('http://localhost:3000')
    await page.bringToFront()
  })

  test("Connect Wallet works", async () => {
    await timeout(3000)
    const button = await page.$('.cta-button')
    await button.click()
    await metamask.confirmTransaction()
    await metamask.confirmTransaction()
    await page.bringToFront()
    await timeout(3000)
    const title = await page.$('.page-title')
    const text = await title.getProperty('textContent');
    const name = await text.jsonValue();
    expect(name).toBe("Your Orders");
    await page.close()
  })
  
  test("HomePage comunica correttamente con la blockchain", async () => {

    await timeout(3000)
    const table = await page.$("table tr td");
    const text = await table.getProperty('textContent');
    const name = await text.jsonValue();
    expect(name).toBeDefined();

  });
  
  test("HomePage carica correttamente OrderPage, e OrderPage comunica correttamente con la blockchain", async () => {
    
    await timeout(3000)
    const button = await page.$('.order-button')
    await button.click()
    await timeout(1000)
    const title = await page.$('.page-title')
    expect(title).toBeDefined();
  
    await timeout(3000)
    const address = await page.$('td.address')
    const text = await address.getProperty('textContent');
    const name = await text.jsonValue();
    expect(name).toBeDefined();
  
  });  

  test("Ecommerce ridireziona alla LandingPage correttamente, che comunica correttamente con la blockchain", async () => {
  
    await page.goto('http://localhost:3001')

    // INSERT PRICE
    await page.waitForSelector('input[name=price]');
    await page.focus('input[name=price]')
    page.keyboard.type('1')
    await timeout(1000)

    // INSERT WALLET ADDRESS
    const wallet = new ethers.Wallet(pvtKey)
    const address = wallet.address;
    await page.waitForSelector('input[name=buyerAddress]');
    await page.focus('input[name=buyerAddress]')
    page.keyboard.type(address)
    await timeout(1000)

    // CLICK SUBMIT
    await page.evaluate(() => {
      document.querySelector('input[type=submit]').click();
    });
    await timeout(3000)

    // CLICK CREATE TRANSACTION AND CHECK IF METAMASK OPENS
    await timeout(5000)
    page = await browser.targets()[browser.targets().length-1].page();
    const button = await page.$('#createOrder')
    await timeout(1500)
    await button.click()
    const metamaskPage = metamask.page;
    expect(metamaskPage._closed).toBe(false)

  });  
});