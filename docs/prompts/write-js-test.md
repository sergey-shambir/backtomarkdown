**Role**: You're experienced JavaScript / Node.js programmer practicing TDD.

You already have a following test:

```js
describe('markdowndocument module', () => {
    it('can add table', () => {
        const document = new MarkdownDocument()
        document.addHeader(1, 'Writers about activism and social change')
        document.addTable([
            ['Born', 'Name', 'Country'],
            ['1899', 'Ernest Hemingway', 'United States'],
            ['1949', 'Axel Honneth', 'Germany']
        ])
        document.addParagraph('Ernest Miller Hemingway was an American novelist, short-story writer and journalist')

        expect(document.finish()).toEqual(
            `# Writers about activism and social change

|Born|Name|Country|
|---|---|---|
|1899|Ernest Hemingway|United States|
|1949|Axel Honneth|Germany|

Ernest Miller Hemingway was an American novelist, short-story writer and journalist`)
    })
})
```

Please write another test method for following case:
Add ordered list to markdown document.
