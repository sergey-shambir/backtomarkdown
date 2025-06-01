const { Builder, Browser, ThenableWebDriver } = require('selenium-webdriver');
const Chrome = require('selenium-webdriver/chrome');

const isHeadless = Boolean(process.env.E2E_HEADLESS || false);
const allowGpu = Boolean(process.env.E2E_ALLOW_GPU || false);

/**
 * Creates a new Selenium WebDriver instance for testing in Chrome / Chromium.
 *
 * @returns {Promise<ThenableWebDriver>} browser driver
 */
async function createChromeDriver() {
    const options = new Chrome.Options();
    options.addArguments('--incognito');
    if (isHeadless) {
        options.addArguments('--headless');
    }
    if (!allowGpu) {
        options.addArguments('--disable-gpu');
    }

    return await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions(options)
        .build();
}

module.exports.createChromeDriver = createChromeDriver
