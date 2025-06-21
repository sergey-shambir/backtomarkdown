const puppeteer = require('puppeteer')
const fs = require('fs/promises')

if (process.argv.length != 4) {
    console.log("Usage: node index.js <url> <output-path>")
    process.exit(1)
}

const url = process.argv[2];
const outputPath = process.argv[3];

const readabilityJsScriptUrl = '/js/readability.js';

(async () => {
    try {
        const browser = await puppeteer.launch()
        try {
            const page = await browser.newPage()
            await page.goto(url, {
                timeout: 30 * 1000,
                waitUntil: 'domcontentloaded'
            })
            await page.addScriptTag({
                type: 'text/javascript',
                url: readabilityJsScriptUrl
            })
            await page.waitForNetworkIdle()

            const article = await page.evaluate('window.getCleanHtml()')
            if (!article) {
                throw new Error('Failed to evaluate readability script')
            }

            const meta = {
                title: article.title,
                excerpt: article.excerpt,
                byline: article.byline,
                dir: article.dir,
                siteName: article.siteName,
                lang: article.lang,
                publishedTime: article.publishedTime,
            }

            await fs.writeFile(outputPath + '.json', JSON.stringify(meta, null, 2))
            console.log(`Article metadata saved to ${outputPath}.json`)
            await fs.writeFile(outputPath, article.content)
            console.log(`Clean readable HTML saved to ${outputPath}`)
        } finally {
            await browser.close()
        }
    }
    catch (error) {
        console.error(`Fatal error: ${error.message}`)
        console.error(error.stack)
        process.exit(1);
    }
})();

