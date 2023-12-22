import { createHash } from 'crypto'

export function getIdFromText(text){
    return createHash('sha1').update(text).digest('hex')
}