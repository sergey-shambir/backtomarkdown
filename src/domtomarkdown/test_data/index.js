const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);

/**
 * 
 * @param {string} dir 
 * @param {string} inputExt 
 * @param {string} expectedExt 
 * @returns {Promise<{
 *   input: string,
 *   expected: string
 * }>}
 */
async function loadTestFilesAsync(dir, inputExt = '.html', expectedExt = '.md') {
    const absDirPath = path.join(__dirname, ...dir.split('/').filter((s) => s !== ''));
    const inputPath = path.join(absDirPath, 'input' + inputExt);
    const expectedPath = path.join(absDirPath, 'expected' + expectedExt);

    const input = await readFileAsync(inputPath);
    const expected = await readFileAsync(expectedPath);

    return {
        input: input.toString(),
        expected: expected.toString()
    }
}

module.exports.loadTestFilesAsync = loadTestFilesAsync;