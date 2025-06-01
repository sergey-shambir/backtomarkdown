const { MarkdownDocument } = require('./markdowndocument')

describe('markdowndocument module', () => {
    it('can add text to current block', () => {
        const document = new MarkdownDocument()
        document.addInlineMarkdown('_Hello_')
        document.addInlineMarkdown(' World')
        expect(document.finish()).toEqual('_Hello_ World')
    })

    it('can finish block explicitly', () => {
        const document = new MarkdownDocument()
        document.addInlineMarkdown('**Hello**')
        document.finishBlock()
        document.addInlineMarkdown('World')
        expect(document.finish()).toEqual('**Hello**\n\nWorld')
    })

    it('can add header', () => {
        const document = new MarkdownDocument()
        document.addHeader(1, 'Hello')
        document.addInlineMarkdown('Brave New')
        document.addHeader(2, 'World')
        expect(document.finish()).toEqual(
            `# Hello

Brave New

## World`)
    })

    it('can add paragraph', () => {
        const document = new MarkdownDocument()
        document.addHeader(1, 'Hello')
        document.addParagraph('Brave New')
        document.addInlineMarkdown('World')
        expect(document.finish()).toEqual(
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
        expect(document.finish()).toEqual(
            `Run tests:

\`\`\`bash
go test -v
\`\`\`

Result:

\`\`\`
?       backtomarkdown  [no test files]
\`\`\``)
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
