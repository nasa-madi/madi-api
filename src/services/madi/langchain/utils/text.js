import { createHash } from 'crypto'
import normalizer from 'normalize-url';

export function getIdFromText(text){
    return createHash('sha1').update(text).digest('hex')
}

export function normalizeUrl(url){
    return normalizer(url, {stripProtocol: true} )
}

export function getIdFromFileBuffer(fileBuffer){
    const hashSum = createHash('sha1');
    hashSum.update(fileBuffer);
    const hex = hashSum.digest('hex');
    return hex
}

/**
 * 
 * @param {string} str The string to split 
 * @param {number} max The max length in characters for each line 
 * @param {string} indent  The way you want the lines to break. 
 * @returns 
 */
export const wordWrap = (str, max, indent = '') => str.replace(
    new RegExp(`(?![^\\n]{1,${max}}$)([^\\n]{1,${max}})\\s|[\\n]`, 'g'), '$1' + '\n' + indent
)
// replace(
//     new RegExp('\n(?=[^\s])', 'g'), '\n' + indent //reaffirm the indent
// )
