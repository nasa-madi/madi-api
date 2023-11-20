// import Debug from 'debug'
// export const debug = Debug
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import {inspect} from 'util'
import { parseBoolean } from './boolean.js';
let pad = 15
let logPrefix = "Debug: "

export const uiDebug = (name,msg)=>{
    if(typeof msg  !== 'string'){
        return chalk.magenta(logPrefix + name +" "+inspect(msg, {colors:true, depth:null}))
    }else{
        return chalk.magenta(logPrefix + name + " "+msg)
    }
}

export const Debug = (name, func=uiDebug) => (...args) => {
    if(parseBoolean(process.env.DEBUG)){
        name = name.indexOf('file:///')>=0 ? fileURLToPath(name).split('/').pop().replace('.js','').toUpperCase().padEnd(pad,' ') : name.padEnd(pad,' ')
        func = func ? func : (a)=>a 
        console.log(func(name,...args))
    }
    
}


