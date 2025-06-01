class MarkdownDocument {
    constructor() {
        this._blocks = [];
        this._currentBlock = '';
    }

    /** Добавляет текст в текущий блок. */
    addInlineMarkdown(text) {
        this._currentBlock += text;
    }

    /**
     * Добавляет блок заголовка.
     *
     * @param {number} level 
     * @param {string} markdown 
     */
    addHeader(level, markdown) {
        if (isNaN(level)) {
            throw new Error('Header level must be an integer number in range 1..6, got ' + level);
        }
        const levelNum = Math.floor(Number(level));
        if (level != levelNum || levelNum < 1 || levelNum > 6) {
            throw new Error('Header level must be an integer number in range 1..6, got ' + level);
        }
        if (!markdown) {
            throw new Error('Header text cannot be empty');
        }

        this.finishBlock();
        this._currentBlock = '#'.repeat(levelNum) + ' ' + markdown;
        this.finishBlock();
    }

    /**
     * Добавляет блок параграфа.
     * @param {string} markdown
     */
    addParagraph(markdown) {
        if (!markdown) {
            throw new Error('Paragraph text cannot be empty');
        }

        this.finishBlock();
        this._currentBlock = markdown;
        this.finishBlock();
    }

    /**
     * Добавляет блок кода
     * @param {string} language - код формального языка, например, `python` или `csharp`
     * @param {string} code - форматированный многострочный код
     */
    addCode(language, code) {
        if (!code) {
            throw new Error('Code cannot be empty');
        }

        // TODO: экранировать блоки кода, содержащие произвольное число символов '`' подряд
        this.finishBlock();
        this._currentBlock = '```' + language + '\n' + code + '\n```';
        this.finishBlock();
    }

    finishBlock() {
        if (this._currentBlock !== '') {
            this._blocks.push(this._currentBlock);
            this._currentBlock = '';
        }
    }

    finish() {
        this.finishBlock();
        return this._blocks.join("\n\n");
    }
}

module.exports.MarkdownDocument = MarkdownDocument;