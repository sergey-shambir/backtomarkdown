const { MarkdownDocument } = require('./markdowndocument')
const { MarkdownOrderedList, MarkdownUnorderedList } = require('./markdownlist')

describe('markdowndocument module', () => {
    it('can add text to current block', () => {
        const document = new MarkdownDocument()
        document.addInlineMarkdown('_Hello_')
        document.addInlineMarkdown(' World')
        expect(document.toMarkdown()).toEqual('_Hello_ World')
    })

    it('can finish block explicitly', () => {
        const document = new MarkdownDocument()
        document.addInlineMarkdown('**Hello**')
        document.finishBlock()
        document.addInlineMarkdown('World')
        expect(document.toMarkdown()).toEqual('**Hello**\n\nWorld')
    })

    it('can add header', () => {
        const document = new MarkdownDocument()
        document.addHeader(1, 'Hello')
        document.addInlineMarkdown('Brave New')
        document.addHeader(2, 'World')
        expect(document.toMarkdown()).toEqual(
            `# Hello

Brave New

## World`)
    })

    it('can add paragraph', () => {
        const document = new MarkdownDocument()
        document.addHeader(1, 'Hello')
        document.addParagraph('Brave New')
        document.addInlineMarkdown('World')
        expect(document.toMarkdown()).toEqual(
            `# Hello

Brave New

World`)
    })

    it('can add code', () => {
        const document = new MarkdownDocument()
        document.addParagraph('Run tests:')
        document.addCode('bash', 'go test -v')
        document.addParagraph('Result:')
        document.addCode('', '?       backtomarkdown  [no test files]')
        document.addCode('', 'Five backquotes: `````')
        expect(document.toMarkdown()).toEqual(
            `Run tests:

\`\`\`bash
go test -v
\`\`\`

Result:

\`\`\`
?       backtomarkdown  [no test files]
\`\`\`

\`\`\`\`\`\`
Five backquotes: \`\`\`\`\`
\`\`\`\`\`\``)
    })

    it('can add table', () => {
        const document = new MarkdownDocument()
        document.addHeader(1, 'Writers about activism and social change')
        document.addTable([
            ['Born', 'Name', 'Country'],
            ['1899', 'Ernest Hemingway', 'United States'],
            ['1949', 'Axel Honneth', 'Germany']
        ])
        document.addParagraph('Ernest Miller Hemingway was an American novelist, short-story writer and journalist')

        expect(document.toMarkdown()).toEqual(
            `# Writers about activism and social change

|Born|Name|Country|
|---|---|---|
|1899|Ernest Hemingway|United States|
|1949|Axel Honneth|Germany|

Ernest Miller Hemingway was an American novelist, short-story writer and journalist`)
    })

    it('can add unordered list', () => {
        const ul = new MarkdownUnorderedList()
        ul.add('The Old Man and the Sea')
        ul.add('For Whom the Bell Tolls')
        ul.add('A Farewell to Arms')

        const document = new MarkdownDocument()
        document.addHeader(2, 'Notable Novels')
        document.addParagraph('Works of fiction include:')
        document.addList(ul)
        document.addParagraph('These novels explore themes of courage and human struggle.')

        expect(document.toMarkdown()).toEqual(
            `## Notable Novels

Works of fiction include:

* The Old Man and the Sea
* For Whom the Bell Tolls
* A Farewell to Arms

These novels explore themes of courage and human struggle.`)
    })

    it('can add ordered list', () => {
        const ol = new MarkdownOrderedList()
        ol.add('JavaScript')
        ol.add('Python')
        ol.add('Go')

        const document = new MarkdownDocument()
        document.addHeader(2, 'Top 3 Programming Languages')
        document.addList(ol)
        document.addParagraph('These languages dominate web development and data science.')

        expect(document.toMarkdown()).toEqual(
            `## Top 3 Programming Languages

1. JavaScript
2. Python
3. Go

These languages dominate web development and data science.`)
    })

    it('cannot add header without level', () => {
        const document = new MarkdownDocument()
        expect(() => document.addHeader('hello')).toThrow(Error)
    })

    it('cannot add header without text', () => {
        const document = new MarkdownDocument()
        expect(() => document.addHeader(1, '')).toThrow(Error)
    })

    it('cannot add paragraph without text', () => {
        const document = new MarkdownDocument()
        expect(() => document.addParagraph('')).toThrow(Error)
    })

    it('cannot add code block without code', () => {
        const document = new MarkdownDocument()
        expect(() => document.addCode('bash')).toThrow(Error)
    })
})
