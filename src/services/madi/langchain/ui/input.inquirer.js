import {
    createPrompt,
    useState,
    useKeypress,
    isEnterKey,
    isBackspaceKey
} from '@inquirer/core';
import chalk from 'chalk';


/**
 * @typedef PromptConfig
 * @type {Object.<string, any>}
 * @property {object} [default] -
 * @property {function} [transformer] -
 * @property {string} [prefix] -
 */

/** 
 * @callback PromptFunc
 * @param {PromptConfig} config
 * @param {function} done
 * @returns {(string | [string,string])}
 */

/** @type {any} */
export default createPrompt(     
    /** @type {PromptFunc} */
    (config, done) => {
    const [status, setStatus] = useState('pending');
    const [defaultValue = '', setDefaultValue] = useState(config.default);
    const [errorMsg, setError] = useState(undefined);
    const [value, setValue] = useState('');

    // const isLoading = status === 'loading';
    const prefix = config.prefix ?? "User:"

    useKeypress(async (key, rl) => {
        // Ignore keypress while our prompt is doing other processing.
        if (status !== 'pending') {
            return;
        }

        if (isEnterKey(key)) {
            const answer = value || defaultValue;
            setStatus('loading');
            const isValid = await config.validate(answer);
            if (isValid === true) {
                setValue(answer);
                setStatus('done');
                done(answer);
            } else {
                // Reset the readline line value to the previous value. On line event, the value
                // get cleared, forcing the user to re-enter the value instead of fixing it.
                rl.write(value);
                setError(isValid || 'You must provide a valid value');
                setStatus('pending');
            }
        } else if (isBackspaceKey(key) && !value) {
            setDefaultValue(undefined);
        } else if (key.name === 'tab' && !value) {
            setDefaultValue(undefined);
            rl.clearLine(0); // Remove the tab character.
            rl.write(defaultValue);
            setValue(defaultValue);
        } else {
            setValue(rl.line);
            setError(undefined);
        }
    });

    const message = chalk.bold(config.message);
    let formattedValue = value;
    if (typeof config.transformer === 'function') {
        formattedValue = config.transformer(value, { isFinal: status === 'done' });
    }
    if (status === 'done') {
        formattedValue = chalk.cyan(formattedValue);
    }

    let defaultStr = '';
    if (defaultValue && status !== 'done' && !value) {
        defaultStr = chalk.dim(` (${defaultValue})`);
    }

    let error = '';
    if (errorMsg) {
        error = chalk.red(`> ${errorMsg}`);
    }

    return [`${prefix}${message}${defaultStr}${formattedValue}`, error];
})