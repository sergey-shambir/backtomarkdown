const { NodeType } = require("./nodetype")

class NodeScanner {

    /**
     * Обходит дочерние узлы всех типов (элементы, текстовые, комментарии и т.д.)
     *
     * @param {Node} node 
     * @param {function(Node):void} callback 
     */
    static scanChildNodes(node, callback) {
        for (let i = 0; i < node.childNodes.length; i++) {
            callback(node.childNodes[i])
        }
    }

    /**
     * Обходит элементы <li> списка <ul> или <ol>
     *
     * @param {HTMLOListElement|HTMLUListElement} table
     * @param {function(HTMLElement):void} callback
     */
    static scanListItems(list, callback) {
        for (let i = 0; i < list.childNodes.length; i++) {
            const child = list.childNodes[i]
            if (NodeType.isElement(child)) {
                const tag = child.tagName.toLowerCase()
                if (tag === 'li') {
                    callback(child)
                }
            }
        }
    }

    /**
     * @param {HTMLDListElement} list 
     * @param {function(HTMLElement,HTMLElement[]):void} callback 
     */
    static scanDefinitions(list, callback) {
        let item = undefined
        for (let i = 0; i < list.childNodes.length; i++) {
            const child = list.childNodes[i]
            if (NodeType.isElement(child)) {
                const tag = child.tagName.toLowerCase()
                if (tag === 'dt') {
                    if (item !== undefined) {
                        callback(item.term, item.definitions)
                    }
                    item = {
                        term: child,
                        definitions: []
                    }
                } else if (tag === 'dd' && item !== undefined) {
                    item.definitions.push(child)
                }
            }
        }
        if (item !== undefined) {
            callback(item.term, item.definitions)
        }
    }

    /**
     * Обходит строки таблицы: <tr>
     *
     * @param {HTMLTableElement|HTMLElement} table
     * @param {function(HTMLTableRowElement):void} callback
     */
    static scanTableRows(table, callback) {
        if (NodeType.isElement(table)) {
            const tag = table.tagName.toLowerCase()
            switch (tag) {
                case 'table':
                case 'thead':
                case 'tbody':
                case 'tfoot':
                    for (let i = 0; i < table.childNodes.length; i++) {
                        this.scanTableRows(table.childNodes[i], callback)
                    }
                    break
                case 'tr':
                    callback(table)
                    break
            }
        }
    }

    /**
     * Обходит ячейки одной строки таблицы: <th> и <td>
     *
     * @param {HTMLTableRowElement} table
     * @param {function(HTMLTableColElement):void} callback
     */
    static scanTableColumns(row, callback) {
        for (let i = 0; i < row.childNodes.length; i++) {
            const child = row.childNodes[i]
            if (NodeType.isElement(child)) {
                const tag = child.tagName.toLowerCase()
                if (tag === 'td' || tag === 'th') {
                    callback(child)
                }
            }
        }
    }
}

module.exports.NodeScanner = NodeScanner