class MarkdownListItem {
    /**
     * @param {string} text 
     * @param {MarkdownList|null} children 
     */
    constructor(text = '', children = null) {
        /**
         * @type {string}
         * */
        this.text = text
        /**
         * @type {MarkdownList|null}
         */
        this.children = children
    }
}

class MarkdownList {
    constructor() {
        if (new.target === MarkdownList) {
            throw new TypeError('Cannot construct MarkdownList instances directly')
        }
        /**
         * @type {MarkdownListItem[]}
         */
        this.items = []
    }

    /**
     * @param {string} text 
     * @param {MarkdownList|null} children 
     */
    add(text, children = null) {
        const item = new MarkdownListItem(text, children)
        this.items.push(item)
    }

    toMarkdown() {
        const lines = []
        this._addMarkdownLines(lines, 0)

        return lines.join('\n')
    }

    /**
     * @param {string[]} lines 
     * @param {number} level 
     * @returns 
     */
    _addMarkdownLines(lines, level = 0) {
        for (let i = 0; i < this.items.length; ++i) {
            const item = this.items[i]
            lines.push(this._renderItemLabel(i, level))
            if (item.children) {
                item.children._addMarkdownLines(lines, level + 1)
            }
        }
    }

    _renderItemLabel(index, level) {
        throw new TypeError('method not implemented')
    }
}

class MarkdownOrderedList extends MarkdownList {
    _renderItemLabel(index, level) {
        const indent = '    '.repeat(level)
        const item = this.items[index]
        return `${indent}${index + 1}. ${item.text}`
    }
}

class MarkdownUnorderedList extends MarkdownList {
    _renderItemLabel(index, level) {
        const indent = '    '.repeat(level)
        const item = this.items[index]
        return `${indent}* ${item.text}`
    }
}

class MarkdownDefinitionList extends MarkdownList {
    constructor() {
        super()
        /**
         * @type {string[]}
         */
        this.terms = []
        /**
         * @type {string[][]}
         */
        this.definitionLists = []
    }

    /**
     * @param {string} term
     * @param {string[]} defintions 
     */
    add(term, defintions) {
        this.terms.push(term)
        this.definitionLists.push(defintions)
    }

    /**
     * @param {string[]} lines 
     * @param {number} level 
     * @returns 
     */
    _addMarkdownLines(lines, level = 0) {
        const indent = '    '.repeat(level)
        for (let i = 0; i < this.terms.length; ++i) {
            const term = this.terms[i]
            const definitions = this.definitionLists[i]
            lines.push(indent + term)
            for (const d of definitions) {
                lines.push(`${indent}:   ${d}`)
            }
        }
    }
}

module.exports.MarkdownOrderedList = MarkdownOrderedList
module.exports.MarkdownUnorderedList = MarkdownUnorderedList
module.exports.MarkdownDefinitionList = MarkdownDefinitionList