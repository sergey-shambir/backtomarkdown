
class TextUtil {
    /**
     * Соединяет фрагменты текста по правилам HTML, то есть:
     *  ['hello', 'world'] => 'helloworld'
     *  ['hello', ' world'] => 'hello world'
     *  ['hello  ', ' world'] => 'hello world'
     *
     * NOTE: поведение может отличаться от RFC по HTML.
     *
     * @param {string[]} chunks
     * @returns {string}
     */
    static joinInlineText(chunks) {
        return chunks.join('').replace(/\s+/, ' ').trim();
    }

    /**
     * Удаляет лишние пробелы из текста по правилам HTML.
     *
     * NOTE: поведение может отличаться от RFC по HTML.
     */
    static cleanInlineText(text) {
        return text.replaceAll(/\s+/g, ' ');
    }

    /**
     * Экранирует спецсимволы markdown, чтобы текст оставался текстом в markdown-документе.
     *
     * NOTE: поведение может отличаться от RFC по HTML.
     */
    static escapeMarkdown(text) {
        return text.replaceAll(/([*_`#\[\]()!~<>|\\{}\-+])/g, '\\$1');
    }
}

module.exports.TextUtil = TextUtil;
