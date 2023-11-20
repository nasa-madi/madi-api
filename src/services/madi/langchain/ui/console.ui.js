import * as dotenv from 'dotenv'
dotenv.config()
// import inquirer from 'inquirer';
import { typeOut } from '../utils/typing.js';
import { router } from '../router/router.js'
import chalk from 'chalk';
import { Debug } from '../utils/logger.js'
import { wordWrap } from '../utils/text.js';
import input from './input.inquirer.js';
import select from './select.inquirer.js';
import { setTimeout } from 'node:timers/promises';

const debug = Debug(import.meta.url)
const UI_CHARS_PER_LINE = process.env.UI_CHARS_PER_LINE ?? 60

/**
 * @typedef {import("../types.js").Metadata} Metadata 
 * @typedef {import("../types.js").ServerResponse} ServerResponse
 * @typedef {import("./input.inquirer.js").PromptFunc} PromptFunc
 * @typedef {import("./input.inquirer.js").PromptConfig} PromptConfig
 */



export default class Console {

    constructor(fields){
        this.typing = false
        this.wrapLength = 60
        this.spacePrefix = "      "
        this.lineSpacing = 0;
        this.aiColor = (msg) => chalk.cyan(msg)
        this.humanPrefix = chalk.yellow("User:  ")
        this.aiPrefix = this.aiColor("AI:    ")
        Object.assign(this,fields)
        this.typingConfg = {
            thinkingDelay: 1000,
            minTypingDelay: 100,
            maxTypingDelay: 500,
            prePause: 0,
            splitByLetter: false 
        }
    }

    initializeConversation = ()=>{
        this.clearTerminal(); //clears terminal history so that run is clean.
    }

    clearTerminal = () => {
        process.stdout.write("\x1B[3J"); // clear the screen and scrollback buffer
        process.stdout.write("\x1B[1J\x1B[H"); // move the cursor to the top-left corner
    }

    debugFunc = (message,metadata)=>{
        let { context = {} } = metadata
        Debug("INVESTIGATION")(context.investigation)
        Debug("DOCUMENT")(context.currentDocument)
        Debug("SCOPE")(context.scope)
    }

    /**
     * 
     * @param {string} message 
     * @param {Metadata} metadata
     * @returns {Promise<string>}
     */
    displayAndCapture = async (message, metadata, response, typingConfg=this.typingConfg) => {
        let { responseType, choices = [], context = {} } = metadata
        let userResponse = {}

        // run the Debug Function for this.  Can and should be overwritten
        this.debugFunc(message, metadata)

        // Display the AI Response
        // for (let i = 0; i < this.lineSpacing; i++) {
        //     process.stdout.write('\n')
        // }
        let wrapMessage = (msg) => wordWrap(msg, this.wrapLength, this.spacePrefix) 
        if(this.typing){
            // await typeOut(chalk.yellow(message),typingConfg)
            await typeOut(this.aiColor(this.aiPrefix+wrapMessage(message)),typingConfg)
        }else{
            process.stdout.write(this.aiColor(this.aiPrefix+wrapMessage(message)))
        }

        // await typeOut(this.aiColor(this.aiPrefix+wrapMessage(message)),typingConfg)



        // Display the User Prompt
        switch (responseType) {
            case "list":
                choices = '\n - '+choices.join('\n - ')
                process.stdout.write(this.aiColor(wrapMessage(choices)))

            case "open":
            default:
                for (let i = 0; i <= this.lineSpacing; i++) {
                    process.stdout.write('\n')
                }
                userResponse = input({message:"", prefix: this.humanPrefix})
                // let defaultValue = Promise.resolve()
                if(response){    
                    try{
                        await setTimeout(500).then(async () => {
                            await this.appendToLine(response)
                            process.stdout.write('\n')
                        });
                    }catch(e){
                        console.log(e)
                    }

                    return Promise.resolve(response)
                }else{
                    await userResponse
                    process.stdout.write('\n')
                    return userResponse
                }
        }

    }

    appendToLine = async (message, typingArgs=this.typingConfg)=>{
        if(this.typing){
            await typeOut(message, this.typingConfg)
        }else{
            process.stdout.write(message)
        }
        for (let i = 0; i < this.lineSpacing; i++) {
            process.stdout.write('\n')
        }
    }

    display = async (message, typingArgs=this.typingConfg)=>{
        if(this.typing){
            await typeOut(chalk.yellow(message), this.typingConfg)
        }else{
            process.stdout.write(chalk.yellow(message))
        }
        for (let i = 0; i < this.lineSpacing; i++) {
            process.stdout.write('\n')
        }
    }

}