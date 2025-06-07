const { MarkdownUnorderedList, MarkdownOrderedList, MarkdownDefinitionList } = require('./markdownlist')

describe('markdown list class', () => {
    it('can render unordered list', () => {
        const list = new MarkdownUnorderedList()
        list.add('Red')
        list.add('Green')
        list.add('Blue')
        expect(list.toMarkdown()).toEqual(
            `* Red
* Green
* Blue`
        )
    })

    it('can render ordered list', () => {
        const list = new MarkdownOrderedList()
        list.add('Red')
        list.add('Green')
        list.add('Blue')
        expect(list.toMarkdown()).toEqual(
            `1. Red
2. Green
3. Blue`
        )
    })

    it('can render definitions list', () => {
        const list = new MarkdownDefinitionList()
        list.add('DOM', ['Document Object Model'])
        list.add('CSS', ['Cascading Style Sheets'])
        list.add('JS', ['JavaScript'])
        list.add('AJAX', ['Asynchronous JavaScript and XML'])

        expect(list.toMarkdown()).toEqual(
            `DOM
:   Document Object Model
CSS
:   Cascading Style Sheets
JS
:   JavaScript
AJAX
:   Asynchronous JavaScript and XML`
        )
    })

    it('can render nested list', () => {
        const ulBlue = new MarkdownUnorderedList()
        ulBlue.add('Deep Blue')
        ulBlue.add('Light Blue')
        ulBlue.add('Indigo')

        const olRed = new MarkdownOrderedList()
        olRed.add('Garnet')
        olRed.add('Ruby')

        const ol = new MarkdownOrderedList()
        ol.add('Red', olRed)
        ol.add('Green')
        ol.add('Blue', ulBlue)
        expect(ol.toMarkdown()).toEqual(
            `1. Red
    1. Garnet
    2. Ruby
2. Green
3. Blue
    * Deep Blue
    * Light Blue
    * Indigo`
        )
    })

    it('can render nested definitions list', () => {
        const ul = new MarkdownUnorderedList()
        ul.add('HTML fundamentals')
        ul.add('CSS styling')

        const dl = new MarkdownDefinitionList()
        dl.add('HTML', ['HyperText Markup Language', 'Recursive acronym'])
        dl.add('CSS', ['Cascading Style Sheets'])

        const ol = new MarkdownOrderedList()
        ol.add('Basics', ul)
        ol.add('Core JavaScript')
        ol.add('Advanced Concepts', dl)

        expect(ol.toMarkdown()).toEqual(
            `1. Basics
    * HTML fundamentals
    * CSS styling
2. Core JavaScript
3. Advanced Concepts
    HTML
    :   HyperText Markup Language
    :   Recursive acronym
    CSS
    :   Cascading Style Sheets`
        )
    })
})
