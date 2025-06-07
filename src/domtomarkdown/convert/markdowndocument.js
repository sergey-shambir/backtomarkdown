const { MarkdownList } = require('./markdownlist')

class MarkdownDocument {
    constructor() {
        /** type {string[]} */
        this._blocks = []
        /** type {string} */
        this._currentBlock = ''
    }

    /** Добавляет текст в текущий блок. */
    addInlineMarkdown(text) {
        this._currentBlock += text
    }

    /**
     * Добавляет блок заголовка.
     *
     * @param {number} level 
     * @param {string} markdown 
     */
    addHeader(level, markdown) {
        if (isNaN(level)) {
            throw new Error('Header level must be an integer number in range 1..6, got ' + level)
        }
        const levelNum = Math.floor(Number(level))
        if (level != levelNum || levelNum < 1 || levelNum > 6) {
            throw new Error('Header level must be an integer number in range 1..6, got ' + level)
        }
        if (!markdown) {
            throw new Error('Header text cannot be empty')
        }

        this.finishBlock()
        this._currentBlock = '#'.repeat(levelNum) + ' ' + markdown
        this.finishBlock()
    }

    /**
     * Добавляет блок параграфа.
     * @param {string} markdown
     */
    addParagraph(markdown) {
        if (!markdown) {
            throw new Error('Paragraph text cannot be empty')
        }

        this.finishBlock()
        this._currentBlock = markdown
        this.finishBlock()
    }

    /**
     * Добавляет таблицу
     * @param {string[][]} rows - массив строк таблицы, где каждая строка — это массив
     *   текстов с markdown-разметкой. Первая строка — заголовки столбцов.
     */
    addTable(rows) {
        if (rows.length < 2) {
            throw new Error('Table should have at least 2 rows: one for headers, others for data')
        }

        const columnCount = rows[0].length
        if (columnCount === 0) {
            throw new Error('Table should have at least 1 column')
        }

        for (let rowIndex = 1; rowIndex < rows.length; ++rowIndex) {
            const rowColumnCount = rows[rowIndex].length
            if (rowColumnCount != columnCount) {
                throw new Error(
                    'Table rows have inconsistent length: ' +
                    `header has ${columnCount} columns, ` +
                    `row ${rowIndex} has ${rowColumnCount} columns`
                )
            }
        }

        const lines = []
        lines.push('|' + rows[0].join('|') + '|')
        lines.push('|' + '---|'.repeat(rows[0].length))
        for (const row of rows.slice(1)) {
            lines.push('|' + row.join('|') + '|')
        }

        this.finishBlock()
        this._currentBlock = lines.join('\n')
        this.finishBlock()
    }

    /**
     * Добавляет нумерованный либо ненумерованный список
     * @param {MarkdownList} list
     */
    addList(list) {
        this.finishBlock()
        this._currentBlock = list.toMarkdown()
        this.finishBlock()
    }

    /**
     * Добавляет блок кода
     * @param {string} language - код формального языка, например, `python` или `csharp`
     * @param {string} code - форматированный многострочный код
     */
    addCode(language, code) {
        if (!code) {
            throw new Error('Code cannot be empty')
        }

        const backquotesCount = this._countCodeBackquotesCount(code)
        const backquotes = '`'.repeat(backquotesCount)

        const results = /`+/g
        let maxBackquotesCount = 0
        for (let match = results.exec(code); match; match = results.exec(code)) {
            maxBackquotesCount = Math.max(maxBackquotesCount, match[0].length)
        }

        this.finishBlock()
        this._currentBlock = backquotes + language + '\n' + code + '\n' + backquotes
        this.finishBlock()
    }

    finishBlock() {
        if (this._currentBlock !== '') {
            this._blocks.push(this._currentBlock)
            this._currentBlock = ''
        }
    }

    /**
     * Возвращает строку текста в формате Markdown.
     * @returns {string}
     */
    toMarkdown() {
        this.finishBlock()
        return this._blocks.join("\n\n")
    }

    /**
     * Определяет число символов backquote (`) для экранирования блока кода
     * 
     * @param {string} code
     * @returns {number}
     */
    _countCodeBackquotesCount(code) {
        let maxBackquotesCount = 3 // По умолчанию блок кода экранируется 3 символами backquote (`).

        const results = /`+/g
        for (let match = results.exec(code); match; match = results.exec(code)) {
            maxBackquotesCount = Math.max(maxBackquotesCount, match[0].length + 1)
        }

        return maxBackquotesCount
    }
}

module.exports.MarkdownDocument = MarkdownDocument