const { MarkdownDocument } = require('./markdowndocument');
const { TextUtil } = require('./textutil')

class DomToMarkdownError {
    /**
     * @param {string} message 
     * @param {Node} node 
     */
    constructor(message, node) {
        this.message = message;
        this.node = node;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.message + ': ' + this.node.outerHTML;
    }

    /**
     * @returns {Error}
     */
    toError() {
        return new Error(this.toString());
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
         * @var {HtmlToMarkdownError[]}
         */
        options = options || {};
        this.errors = [];
        this.options = {
            throwOnError: options.throwOnError || false
        };
    }

    getBlockMarkdown(block) {
        const self = this;
        const document = new MarkdownDocument();

        /**
         * @param {Node|Element} node
         */
        function walk(node) {
            if (self._isTextNode(node)) {
                document.addInlineMarkdown(self.getInlineMarkdown(node));
                return;
            }
            if (self._isElementNode(node)) {
                const tag = node.tagName.toLowerCase();
                if (self._isInlineTag(tag)) {
                    document.addInlineMarkdown(self.getInlineMarkdown(node));
                    return;
                }

                switch (tag) {
                    case 'div':
                    case 'article':
                    case 'p':
                        document.finishBlock()
                        for (let i = 0; i < node.childNodes.length; i++) {
                            walk(node.childNodes[i]);
                        }
                        document.finishBlock()
                        break;

                    case 'h1':
                        document.addHeader(1, self.getInlineMarkdown(node));
                        break;

                    case 'h2':
                        document.addHeader(2, self.getInlineMarkdown(node));
                        break;

                    case 'h3':
                        document.addHeader(3, self.getInlineMarkdown(node));
                        break;

                    case 'h4':
                        document.addHeader(4, self.getInlineMarkdown(node));
                        break;

                    case 'h5':
                        document.addHeader(5, self.getInlineMarkdown(node));
                        break;

                    case 'h6':
                        document.addHeader(6, self.getInlineMarkdown(node));
                        break;

                    default:
                        self._addError(`Unexpected HTML tag "${tag}": `, node);
                        document.finishBlock()
                        for (let i = 0; i < node.childNodes.length; i++) {
                            walk(node.childNodes[i]);
                        }
                        document.finishBlock()
                        break;
                }
            }
        }

        walk(block);

        return document.finish();
    }

    /**
     * Разбирает содержимое блочного DOM-узла, содержащего параграф текста с inline-тегами форматирования.
     *
     * @param {Node} block
     * @returns {string}
     */
    getInlineMarkdown(block) {
        const self = this;
        let chunks = [];

        /**
         * @param {Node|Element} node
         * @param {boolean} expectBlock
         */
        function walk(node, expectBlock) {
            if (self._isTextNode(node)) {
                chunks.push(TextUtil.cleanInlineText(node.textContent));
            } else if (self._isElementNode(node)) {
                const tag = node.tagName.toLowerCase();
                switch (tag) {
                    case 'strong':
                    case 'b':
                        {
                            const text = self.getInlineText(node);
                            if (text) {
                                chunks.push('**' + text + '**');
                            }
                        }
                        break;

                    case 'em':
                    case 'i':
                        {
                            const text = self.getInlineText(node);
                            if (text) {
                                chunks.push('_' + text + '_');
                            }
                        }
                        break;

                    case 'u':
                    case 'ins':
                        {
                            const text = self.getInlineText(node);
                            if (text) {
                                chunks.push('<ins>' + text + '</ins>');
                            }
                        }
                        break;

                    case 's':
                    case 'del':
                        {
                            const text = self.getInlineText(node);
                            if (text) {
                                chunks.push('<del>' + text + '</del>');
                            }
                        }
                        break;

                    case 'sup':
                        {
                            const text = self.getInlineText(node);
                            if (text) {
                                chunks.push('<sup>' + text + '</sup>');
                            }
                        }
                        break;

                    case 'sub':
                        {
                            const text = self.getInlineText(node);
                            if (text) {
                                chunks.push('<sub>' + text + '</sub>');
                            }
                        }
                        break;

                    case 'tt':
                    case 'code':
                        {
                            const text = self.getInlineText(node);
                            if (text) {
                                chunks.push('`' + text + '`');
                            }
                        }
                        break;

                    case 'img':
                        {
                            const alt = node.getAttribute('alt');
                            const src = node.getAttribute('src');
                            const title = node.getAttribute('title');
                            if (!src) {
                                self._addError(`Image "${tag}" has no "src" attribute: `, node)
                            } else {
                                chunks.push(title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`);
                            }
                        }
                        break;

                    case 'a':
                        {
                            const text = self.getInlineText(node);
                            const href = node.getAttribute('href');
                            const title = node.getAttribute('title');
                            if (!href) {
                                self._addError(`Hyperlink "${tag}" has no "href" attribute`, node);
                            } else {
                                chunks.push(title ? `[${text}](${href} "${title}")` : `[${text}](${href})`);
                            }
                        }
                        break;

                    default:
                        if (!expectBlock) {
                            self._addError(`Unexpected inline HTML tag "${tag}": `, node);
                        }
                        for (let i = 0; i < node.childNodes.length; i++) {
                            walk(node.childNodes[i]);
                        }
                        break;
                }
            }
        }

        walk(block, true);

        return this.joinInlineMarkdown(chunks);
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
        let result = '';
        let needsSpace = false;
        for (const text of chunks) {
            const textTrimmedStart = text.trimStart();
            const textTrimmedEnd = textTrimmedStart.trimEnd();

            if (textTrimmedEnd != '') {
                if (needsSpace || (textTrimmedStart !== text)) {
                    result += ' ';
                }
                if (textTrimmedEnd) {
                    result += textTrimmedEnd;
                }
                needsSpace = (textTrimmedEnd != textTrimmedStart);
            } else {
                needsSpace = needsSpace || (text != '');
            }
        }
        return result.trimStart();
    }

    /**
     * Разбирает содержимое блочного либо inline DOM-узла и возвращает его как текст без форматирования.
     *
     * @param {Node} block
     * @returns {string}
     */
    getInlineText(block) {
        const self = this;
        let chunks = [];

        /**
         * @param {Node|Element} node
         */
        function walk(node) {
            if (self._isTextNode(node)) {
                chunks.push(TextUtil.cleanInlineText(node.textContent));
            } else if (self._isElementNode(node)) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    walk(node.childNodes[i]);
                }
            }
        }
        walk(block);

        return TextUtil.joinInlineText(chunks);
    }

    /**
     * @param {Node} node 
     * @returns {boolean}
     */
    _isTextNode(node) {
        return node.nodeType == 3;
    }

    /**
     * @param {Node} node 
     * @returns {boolean}
     */
    _isElementNode(node) {
        return node.nodeType == 1;
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
                return true;

            default:
                return false;
        }
    }

    /**
     * @param {string} message 
     * @param {Node} node 
     */
    _addError(message, node) {
        const error = new DomToMarkdownError(message, node);
        if (this.options.throwOnError) {
            throw error.toError();
        }
        this.errors.push(error);
    }
}

module.exports.DomToMarkdownError = DomToMarkdownError;
module.exports.DomToMarkdownConverter = DomToMarkdownConverter;