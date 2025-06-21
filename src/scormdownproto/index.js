const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const TurndownService = require('turndown')
const { join } = require('path')

if (process.argv.length != 4) {
    console.log("Usage: node index.js <url> <output-path>")
    process.exit(1)
}

const url = process.argv[2];

const outputDir = join(__dirname, 'output')
const readabilityJsScriptUrl = '/js/readability.js';

async function saveOutputFile(name, description, content) {
    const stat = await fs.stat(outputDir)
    if (!stat) {
        await fs.mkdir(outputDir, {
            recursive: true
        })
    }

    const outputPath = join(outputDir, name)
    await fs.writeFile(outputPath, content)
    console.log(`${description} saved to ${outputPath}`)
}

/**
 * @typedef {Object} ReadabilityOutput
 * @property {string} title
 * @property {string} excerpt
 * @property {string} byline
 * @property {string} dir
 * @property {string} siteName
 * @property {string} lang
 * @property {string} publishedTime
 * @property {string} content
 */

/**
 * @param {ReadabilityOutput} article 
 * @returns {string}
 */
function buildMarkdownFrontmatter(article) {
    const lines = []
    const addLine = (name, value) => {
        if (value) {
            lines.push(`${name}: ${JSON.stringify(value)}`)
        }
    }

    addLine('title', article.title)
    addLine('description', article.excerpt)
    addLine('date', article.publishedTime)
    addLine('author', article.byline)
    addLine('language', article.lang)

    if (lines.length === 0) {
        return ''
    }

    return '---\n' + lines.join('\n') + '\n---\n\n'
}

/**
 * @param {ReadabilityOutput} article 
 * @returns {string}
 */
function articleToMarkdown(article) {
    const frontmatter = buildMarkdownFrontmatter(article)
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced'
    })
    const markdown = turndownService.turndown(article.content)

    return frontmatter + markdown
}

/**
 * @param {ReadabilityOutput} article 
 * @returns {string}
 */
function readabilityMetadataToJson(article) {
    const meta = {
        title: article.title,
        excerpt: article.excerpt,
        byline: article.byline,
        dir: article.dir,
        siteName: article.siteName,
        lang: article.lang,
        publishedTime: article.publishedTime,
    }
    return JSON.stringify(meta, null, 2)
}

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

            const articleMetadataJson = readabilityMetadataToJson(article)
            const markdown = articleToMarkdown(article)

            await saveOutputFile('article.json', 'Metadata', articleMetadataJson)
            await saveOutputFile('article.html', 'Clean readable HTML', article.content)
            await saveOutputFile('article.md', 'Markdown', markdown)
        } finally {
            await browser.close()
        }
    }
    catch (error) {
        console.error(`Fatal error: ${error.message}`)
        console.error(error.stack)
        process.exit(1);
    }
    console.log('Completed OK')
})();

