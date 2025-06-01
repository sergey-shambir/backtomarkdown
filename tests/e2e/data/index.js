const path = require('path')

function getDataDir() {
    return __dirname
}

function resolve(filePath) {
    return path.resolve(getDataDir(), filePath)
}

module.exports.resolve = resolve
module.exports.getDataDir = getDataDir
