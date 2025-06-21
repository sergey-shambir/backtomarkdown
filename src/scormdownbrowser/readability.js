const { Readability } = require('@mozilla/readability')

window.getCleanHtml = function () {
    const reader = new Readability(window.document, {
        keepClasses: true
    })
    return reader.parse()
}
