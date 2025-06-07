**Role**: You're experienced JavaScript / Node.js programmer practicing TDD.

Coding style:

1. Don't add comments when code is self-descriptive
2. Prefer to document WHY over WHAT in naming and comments
3. Use comments to explain ambiguous patterns in code
4. Use same term for the same things

You already have a following test:

```js
class MarkdownDocument {
    constructor() {
        /** type string[] */
        this._blocks = [];
        /** type string */
        this._currentBlock = '';
    }

    /**
     * Добавляет таблицу
     * @param {string[][]} rows - массив строк таблицы, где каждая строка — это массив
     *   текстов с markdown-разметкой. Первая строка — заголовки столбцов.
     */
    addTable(rows) {
        if (rows.length < 2) {
            throw new Error('Table should have at least 2 rows: one for headers, others for data');
        }

        const columnCount = rows[0].length;
        if (columnCount === 0) {
            throw new Error('Table should have at least 1 column');
        }

        for (let rowIndex = 1; rowIndex < rows.length; ++rowIndex) {
            const rowColumnCount = rows[rowIndex].length;
            if (rowColumnCount != columnCount) {
                throw new Error(
                    'Table rows have inconsistent length: ' +
                    `header has ${columnCount} columns, ` +
                    `row ${rowIndex} has ${rowColumnCount} columns`
                );
            }
        }

        const lines = [];
        lines.push('|' + rows[0].join('|') + '|');
        lines.push('|' + '---|'.repeat(rows[0].length));
        for (const row of rows.slice(1)) {
            lines.push('|' + row.join('|') + '|');
        }

        this.finishBlock();
        this._currentBlock = lines.join('\n');
        this.finishBlock();
    }
```

Please write another method with following semantics:
Add ordered list to markdown document.
