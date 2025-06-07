const ELEMENT_NODE = 1
const TEXT_NODE = 3

class NodeType {
    /**
     * Проверяет, является ли узел текстовым.
     *
     * @param {Node} node 
     * @returns {boolean}
     */
    static isText(node) {
        return node.nodeType == TEXT_NODE
    }

    /**
     * Проверяет, является ли узел элементом с тегом.
     *
     * @param {Node} node 
     * @returns {boolean}
     */
    static isElement(node) {
        return node.nodeType == ELEMENT_NODE
    }
}

module.exports.NodeType = NodeType