const puppeteer = require("puppeteer");
const dappeteer = require("@chainsafe/dappeteer");
const { exec } = require('child_process')

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

  await metamask.importPK(pvtKey)
  await metamask.switchAccount(1);
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
    await page.close()
  })

  test("TI04 - RegisterSeller Page comunica correttamente con la blockchain", async () => {
    await page.goto('http://localhost:3000/register-seller')
    await timeout(1500)
    const button = await page.$('.cta-button')
    await timeout(1500)
    await button.click()
    const metamaskPage = metamask.page;
    expect(metamaskPage._closed).toBe(false)
  });  

});