const { ThenableWebDriver, By, Key, until } = require('selenium-webdriver');
const { createChromeDriver } = require('../util/driver');

describe.skip('Can search in Yandex', () => {
    /**
     * @type {ThenableWebDriver}
     */
    let driver;

    beforeAll(async () => {
        driver = await createChromeDriver();
    })

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    })

    it('Can search for "webdriver" in Yandex', async () => {
        await driver.get('https://ya.ru/')
        await driver.findElement(By.id('text')).sendKeys('webdriver', Key.RETURN)
        await driver.wait(until.titleContains('webdriver'), 10000)

        expect(await driver.getTitle()).toEqual('webdriver — Яндекс: нашлось 5 тыс. результатов')
    })
})