const { describe, test, expect } = require("@jest/globals");
const { JSDOM } = require('jsdom');

const { DomToMarkdownConverter } = require('./domtomarkdown');
const { loadTestFilesAsync } = require('../test_data');

describe('domtomarkdown module', () => {
    test.each([
        'inline/01_img',
        'inline/02_link',
        'inline/03_inline_styles',
        'inline/04_inline_code',
    ])('can parse inline html at "%s"', async (dir) => {
        const { input, expected } = await loadTestFilesAsync(dir);
        const fragment = JSDOM.fragment(input);
        expect(fragment.children.length).toBe(1);

        const converter = new DomToMarkdownConverter({
            throwOnError: true
        });
        const markdown = converter.getInlineMarkdown(fragment.children[0]);
        expect(markdown).toBe(expected);
    })

    test.each([
        'block/01_paragraphs',
        'block/02_table',
    ])('can parse block html at "%s"', async (dir) => {
        const { input, expected } = await loadTestFilesAsync(dir);
        const fragment = JSDOM.fragment(input);
        expect(fragment.children.length).toBe(1);

        const converter = new DomToMarkdownConverter({
            throwOnError: true
        });
        const markdown = converter.getBlockMarkdown(fragment.children[0]);
        expect(markdown).toBe(expected);
    })
})

