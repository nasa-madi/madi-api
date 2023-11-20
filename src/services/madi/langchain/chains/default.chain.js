import { BaseChain } from "langchain/chains";
import * as dotenv from 'dotenv'


// import { Debug } from '../../../logger.js'
// const debug = Debug(import.meta.url)
dotenv.config()

/**
 * @typedef {import("../types.js").Metadata} Metadata 
 * @typedef {import("../types.js").ServerResponse} ServerResponse
 */


/**
 * This is a Default Chain for custom Chain building without the overhead of required functions in every subclass
 */
export class DefaultChain extends BaseChain{
    constructor(fields){
        super(fields);
        this.outputKey = fields.outputKey ?? this.outputKey;
        this.chainName = fields.name ?? this.chainName;
        this.passField = fields.passField ?? this.outputKey;
        this.inputVariables = fields.inputVariables || [];
        this.outputParser = fields.outputParser ?? this.outputParser;
        this.splitOnField = fields.splitOnField ?? null
    }
    get outputKeys() {return [this.outputKey];}
    _chainType(){ return this.chainName}
    get inputKeys() {return this.inputVariables || []}
    _call(values){return Promise.resolve(values)}
}

