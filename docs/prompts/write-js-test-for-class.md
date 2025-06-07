**Role**: You're experienced JavaScript / Node.js programmer practicing TDD.

You already have a following class:

```js
class MarkdownListItem {
    /**
     * @param {string} text 
     * @param {MarkdownList|null} children 
     */
    constructor(text = '', children = null) {
        /** type {string} */
        this._text = text;
        /** type {MarkdownList|null} */
        this._children = children;
    }
}

class MarkdownList {
    constructor() {
        /**
         * type {MarkdownListItem[]}
         */
        this._items = [];
    }

    /**
     * @param {string} text 
     * @param {MarkdownList|null} children 
     */
    add(text, children = null) {
        const item = new MarkdownListItem(text, children);
        this._items.push(item);
    }
}
```

You already have a following tests for another class

```js
const { MarkdownDocument } = require('./markdowndocument')

describe('markdowndocument module', () => {
    it('can add text to current block', () => {
        const document = new MarkdownDocument()
        document.addInlineMarkdown('_Hello_')
        document.addInlineMarkdown(' World')
        expect(document.finish()).toEqual('_Hello_ World')
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
})
```

Please first plan the test list for this class.
Then write tests using jest `describe` and `it` functions.