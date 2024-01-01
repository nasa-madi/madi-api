import messageReducer from './src/services/utils/deltaReducer.js';
import fs from 'fs';

let chunks = JSON.parse(fs.readFileSync('./chunks.json', 'utf8'));

let message = {};

for (const chunk of chunks) {
    message = messageReducer(message, chunk);
    console.log(message);
}