const { describe, test, expect } = require("@jest/globals");

const { TextUtil } = require('./textutil');

describe('markdown module', () => {
    test.each([
        [['hello', 'world'], 'helloworld'],
        [['hello', ' world'], 'hello world'],
        [['hello  ', '  world'], 'hello world'],
        [['hello  ', ' ', ' ', '  world'], 'hello world'],
        [['hello', '\n', 'world'], 'hello world'],
        [['hello\n\nworld'], 'hello world'],
        [['\n   '], ''],
    ])('can join "%s" into "%s"', (chunks, expected) => {
        expect(TextUtil.joinInlineText(chunks)).toBe(expected);
    });

    test.each([
        ["Это *жирный* текст", "Это \\*жирный\\* текст"],
        ["Это _курсивный_ текст", "Это \\_курсивный\\_ текст"],
        ["Это ~~Зачеркнутый~~ текст", "Это \\~\\~Зачеркнутый\\~\\~ текст"],
        [">Цитата", "\\>Цитата"],
        ["[Ссылка](https://example.com)", "\\[Ссылка\\]\\(https://example.com\\)"],
        ["![Изображение](https://example.com)", "\\!\\[Изображение\\]\\(https://example.com\\)"],
    ])('can escape markdown "%s" into "%s"', (markdown, expected) => {
        expect(TextUtil.escapeMarkdown(markdown)).toBe(expected);
    });
});
