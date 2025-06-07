const { MarkdownDocument } = require('./markdowndocument')
const { MarkdownUnorderedList, MarkdownOrderedList, MarkdownDefinitionList } = require('./markdownlist')
const { NodeScanner } = require('./nodescanner')
const { NodeType } = require('./nodetype')
const { TextUtil } = require('./textutil')

class DomToMarkdownError {
    /**
     * @param {string} message 
     * @param {Node} node 
     */
    constructor(message, node) {
        this.message = message
        this.node = node
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.message + ': ' + this.node.outerHTML
    }

    /**
     * @returns {Error}
     */
    toError() {
        return new Error(this.toString())
    }
}

/**
 * Вспомогательные функции для преобразования различных фрагментов HTML документа в markdown.
 */
class DomToMarkdownConverter {
    /**
     * @param {{
     *   throwOnError: boolean
     * } | undefined} options 
     */
    constructor(options) {
        /**
         * type {HtmlToMarkdownError[]}
         */
        options = options || {}
        this.errors = []
        this.options = {
            throwOnError: options.throwOnError || false
        }
    }

    getBlockMarkdown(block) {
        const self = this
        const document = new MarkdownDocument()

        /**
         * @param {Node|Element} node
         */
        function walk(node) {
            if (NodeType.isText(node)) {
                document.addInlineMarkdown(self.getNodesInlineMarkdown([node]))
                return
            }
            if (NodeType.isElement(node)) {
                const tag = node.tagName.toLowerCase()
                if (self._isInlineTag(tag)) {
                    document.addInlineMarkdown(self.getNodesInlineMarkdown([node]))
                    return
                }

                switch (tag) {
                    case 'div':
                    case 'article':
                    case 'p':
                        document.finishBlock()
                        NodeScanner.scanChildNodes(node, walk)
                        document.finishBlock()
                        break

                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                    case 'h5':
                    case 'h6':
                        document.addHeader(parseInt(tag[1]), self.getBlockInlineMarkdown(node))
                        break

                    case 'table':
                        document.addTable(self._getTableContents(node))
                        break

                    case 'ul':
                    case 'ol':
                    case 'dl':
                        document.addList(self._getMarkdownList(node))
                        break

                    case 'pre':
                        document.addCode(self._getPreformattedCodeLanguage(node), self._getPreformattedCode(node))
                        break

                    default:
                        self._addError(`Unexpected HTML tag "${tag}": `, node)
                        document.finishBlock()
                        NodeScanner.scanChildNodes(node, walk)
                        document.finishBlock()
                        break
                }
            }
        }

        walk(block)

        return document.toMarkdown()
    }

    /**
     * 
     * @param {HTMLUListElement|HTMLOListElement|HTMLDListElement} node 
     */
    _getMarkdownList(node) {
        const tag = node.tagName.toLowerCase()

        /**
         * Собирает дочерние узлы элемента списка до первого вложенного списка.
         * @param {HTMLElement} li
         * @returns {{nodes:HTMLElement[], nestedList:HTMLElement|null}}
         */
        function splitListItemChildren(li) {
            const nodes = []
            let nestedList = null
            for (let i = 0; i < li.childNodes.length; ++i) {
                const child = li.childNodes[i]
                if (NodeType.isElement(child) && ['ul', 'ol', 'dl'].includes(child.tagName.toLowerCase())) {
                    nestedList = child
                    break
                } else {
                    nodes.push(child)
                }
            }
            return {
                nodes: nodes,
                nestedList: nestedList
            }
        }

        switch (tag) {
            case 'ul':
                {
                    const list = new MarkdownUnorderedList()
                    NodeScanner.scanListItems(node, (li) => {
                        const { nodes, nestedList } = splitListItemChildren(li)
                        const label = this.getNodesInlineMarkdown(nodes)
                        const nested = nestedList ? this._getMarkdownList(nestedList) : null
                        list.add(label, nested)
                    })
                    return list
                }

            case 'ol':
                {
                    const list = new MarkdownOrderedList()
                    NodeScanner.scanListItems(node, (li) => {
                        const { nodes, nestedList } = splitListItemChildren(li)
                        const label = this.getNodesInlineMarkdown(nodes)
                        const nested = nestedList ? this._getMarkdownList(nestedList) : null
                        list.add(label, nested)
                    })
                    return list
                }

            case 'dl':
                {
                    const list = new MarkdownDefinitionList()
                    NodeScanner.scanDefinitions(node, (term, definitions) => {
                        list.add(this.getBlockInlineMarkdown(term), definitions.map((d) => this.getBlockInlineMarkdown(d)))
                    })
                    return list
                }

            default:
                throw new Error(`Unexpected list tag ${tag}`)
        }
    }

    /**
     * @param {HTMLTableElement} table
     * @return {string[][]}
     */
    _getTableContents(table) {
        const rows = []
        NodeScanner.scanTableRows(table, (tr) => {
            const row = []
            NodeScanner.scanTableColumns(tr, (td) => {
                row.push(this.getBlockInlineMarkdown(td))
            })
            if (row.length > 0) {
                rows.push(row)
            }
        })

        return rows
    }

    /**
     * Получает язык программирования блока кода путём эвристик:
     * - обходит следующие элементы: <pre>, единственный дочерний узел <pre>, цепочка предков <pre> с тегом code, <div>
     * - предполагает, что язык задан в атрибуте class в формате `language-<lang>`
     *
     * @param {HTMLPreElement} pre 
     */
    _getPreformattedCodeLanguage(pre) {

        /**
         * @param {HTMLElement} node
         * @returns {string|undefined}
         */
        function findLanguageByClass(node) {
            const prefix = 'language-'
            for (const className of node.classList.values()) {
                if (className.startsWith(prefix)) {
                    return className.substring(prefix.length)
                }
            }
            return undefined
        }

        let language = findLanguageByClass(pre)
        if (language) {
            return language
        }
        if (pre.childNodes.length === 1) {
            const child = pre.childNodes[0]
            if (NodeType.isElement(child)) {
                language = findLanguageByClass(child)
                if (language) {
                    return language
                }
            }
        }
        for (let parent = pre.parentElement; parent; parent = parent.parentElement) {
            if (parent.tagName.toLowerCase() !== 'div') {
                break
            }
            language = findLanguageByClass(parent)
            if (language) {
                return language
            }
        }
        return ''
    }

    /**
     * Получает содержимое <pre> как код с заданным форматированием,
     *  при этом <br> превращается в перенос строки.
     *
     * @param {HTMLPreElement} pre 
     */
    _getPreformattedCode(pre) {
        let code = ''

        /**
         * @param {HTMLElement} node
         */
        function walk(node) {
            if (NodeType.isText(node)) {
                code += node.textContent
            } else if (NodeType.isElement(node)) {
                const tag = node.tagName.toLowerCase()
                if (tag === 'br') {
                    code += '\n'
                } else {
                    NodeScanner.scanChildNodes(node, walk)
                }
            }
        }

        walk(pre)

        if (code.startsWith('\n')) {
            code = code.substring(1)
        }
        if (code.endsWith('\n')) {
            code = code.substring(0, code.length - 1)
        }

        return code
    }

    /**
     * Разбирает содержимое блочного DOM-узла, содержащего параграф текста с inline-тегами форматирования.
     *
     * @param {Node} block
     * @returns {string}
     */
    getBlockInlineMarkdown(block) {
        return this.getNodesInlineMarkdown([...block.childNodes])
    }

    /**
     * Разбирает DOM-узлы, относящиеся к одному параграфу текста с inline-тегами форматирования.
     *
     * @param {Node[]} nodes
     * @returns {string}
     */
    getNodesInlineMarkdown(nodes) {
        const self = this
        const chunks = []

        const wrapperTagRules = {
            'strong': ['**', '**'],
            'b': ['**', '**'],
            'em': ['_', '_'],
            'i': ['_', '_'],
            'u': ['<ins>', '</ins>'],
            'ins': ['<ins>', '</ins>'],
            's': ['<del>', '</del>'],
            'del': ['<del>', '</del>'],
            'sup': ['<sup>', '</sup>'],
            'sub': ['<sub>', '</sub>'],
            'tt': ['`', '`'],
            'code': ['`', '`'],
        }

        /**
         * @param {Node|Element} node
         */
        function walk(node) {
            if (NodeType.isText(node)) {
                chunks.push(TextUtil.cleanInlineText(node.textContent))
            } else if (NodeType.isElement(node)) {
                const tag = node.tagName.toLowerCase()
                const rule = wrapperTagRules[tag]
                if (rule) {
                    const text = self.getInlineText(node)
                    if (text) {
                        chunks.push(rule[0] + text + rule[1])
                    }
                } else if (tag === 'img') {
                    const markdown = self._getInlineImageMarkdown(node)
                    if (markdown !== undefined) {
                        chunks.push(markdown)
                    }
                } else if (tag === 'a') {
                    const markdown = self._getLinkMarkdown(node)
                    if (markdown !== undefined) {
                        chunks.push(markdown)
                    }
                } else if (tag === 'span') {
                    NodeScanner.scanChildNodes(node, walk)
                } else {
                    self._addError(`Unexpected inline HTML tag "${tag}": `, node)
                    NodeScanner.scanChildNodes(node, walk)
                }
            }
        }

        for (const node of nodes) {
            walk(node)
        }

        return this.joinInlineMarkdown(chunks)
    }

    /**
     * @param {HTMLElement} node 
     * @returns {string|undefined}
     */
    _getInlineImageMarkdown(node) {
        const alt = node.getAttribute('alt')
        const src = node.getAttribute('src')
        const title = node.getAttribute('title')
        if (!src) {
            this._addError(`Image "${tag}" has no "src" attribute: `, node)
            return undefined
        }
        return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`
    }

    /**
     * @param {HTMLElement} node 
     * @returns {string|undefined}
     */
    _getLinkMarkdown(node) {
        const text = this.getInlineText(node)
        const href = node.getAttribute('href')
        const title = node.getAttribute('title')
        if (!href) {
            this._addError(`Hyperlink "${tag}" has no "href" attribute`, node)
            return undefined
        }
        return title ? `[${text}](${href} "${title}")` : `[${text}](${href})`
    }

    /**
     * Соединяет фрагменты inline markdown по правилам HTML, то есть:
     *  ['hello', 'world'] => 'helloworld'
     *  ['hello', ' world'] => 'hello world'
     *  ['hello  ', ' world'] => 'hello world'
     *
     * @param {string[]} chunks
     * @returns {string}
     */
    joinInlineMarkdown(chunks) {
        let result = ''
        let needsSpace = false
        for (const text of chunks) {
            const textTrimmedStart = text.trimStart()
            const textTrimmedEnd = textTrimmedStart.trimEnd()

            if (textTrimmedEnd != '') {
                if (needsSpace || (textTrimmedStart !== text)) {
                    result += ' '
                }
                if (textTrimmedEnd) {
                    result += textTrimmedEnd
                }
                needsSpace = (textTrimmedEnd != textTrimmedStart)
            } else {
                needsSpace = needsSpace || (text != '')
            }
        }
        return result.trimStart()
    }

    /**
     * Разбирает содержимое блочного либо inline DOM-узла и возвращает его как текст без форматирования.
     *
     * @param {Node} block
     * @returns {string}
     */
    getInlineText(block) {
        let chunks = []

        /**
         * @param {Node|Element} node
         */
        function walk(node) {
            if (NodeType.isText(node)) {
                chunks.push(TextUtil.cleanInlineText(node.textContent))
            } else if (NodeType.isElement(node)) {
                NodeScanner.scanChildNodes(node, walk)
            }
        }
        walk(block)

        return TextUtil.joinInlineText(chunks)
    }

    /**
     * @param {string} tag - название HTML тега
     * @returns {bool} - true, если указанный HTML тег является inline тегом
     */
    _isInlineTag(tag) {
        switch (tag) {
            case 'strong':
            case 'b':
            case 'em':
            case 'i':
            case 'u':
            case 'ins':
            case 's':
            case 'del':
            case 'sup':
            case 'sub':
            case 'tt':
            case 'code':
            case 'img':
            case 'a':
            case 'span':
                return true

            default:
                return false
        }
    }

    /**
     * @param {string} message 
     * @param {Node} node 
     */
    _addError(message, node) {
        const error = new DomToMarkdownError(message, node)
        if (this.options.throwOnError) {
            throw error.toError()
        }
        this.errors.push(error)
    }
}

module.exports.DomToMarkdownError = DomToMarkdownError
module.exports.DomToMarkdownConverter = DomToMarkdownConverter