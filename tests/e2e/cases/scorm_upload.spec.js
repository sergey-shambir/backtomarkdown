const { By, ThenableWebDriver, until } = require('selenium-webdriver')
const assert = require('assert')
const data = require('../data');
const { createChromeDriver } = require('../util/driver');

describe('SCORM Upload', function () {
    /**
     * @type {ThenableWebDriver}
     */
    let driver

    beforeAll(async () => {
        driver = await createChromeDriver()
    })

    afterAll(async () => {
        if (driver) {
            await driver.quit()
        }
    })

    it('should upload and display SCORM package', async () => {
        await driver.get('http://localhost:8080')

        const upload = await driver.findElement(By.css('input[type="file"]'))
        await upload.sendKeys(data.resolve('TDD with golang.zip'))

        const submit = await driver.findElement(By.css('button[type="submit"]'))
        await submit.click()

        await driver.wait(until.elementLocated(By.css('#content iframe')), 10000)

        const iframe = await driver.findElement(By.css('#content iframe'))
        assert.ok(iframe)
    });
});