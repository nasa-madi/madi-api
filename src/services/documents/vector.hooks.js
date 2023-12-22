import { resolve, virtual } from '@feathersjs/schema'

import { fetchEmbedding } from '../utils/fetchEmbedding.js'
import { createHash } from 'crypto'
// import normalizer from 'normalize-url';

export function getIdFromText(text){
    return createHash('sha1').update(text).digest('hex')
}


export const addVectorResolver = resolve({

})

export const addHashResolver = resolve({

})