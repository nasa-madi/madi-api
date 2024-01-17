import { NodeVM } from 'vm2';
import path from 'path';
// import http from 'http';
// import https from 'https';
// import stream from 'stream';
// import util from 'util';
// import zlib from 'zlib';
// import url from 'url';


// Inbuilt Library Support
// import ajv from 'ajv';
// import atob from 'atob';
// import btoa from 'btoa';
// import lodash from 'lodash';
// import moment from 'moment';
// import uuid from 'uuid';
// import nanoid from 'nanoid';
import axios from 'axios';
import { inspect } from 'util';
// import fetch from 'node-fetch';
// import CryptoJS from 'crypto-js';
// import NodeVault from 'node-vault';
import * as chai from 'chai';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import StackTracey from 'stacktracey'

function convertToVMStackError(e){
  if (!e.stack.includes("/node_modules/vm2/")) {
		// This is not a vm2 error, so print it normally
		console.log(e);
		return;
	}
	const oldStack = new StackTracey(e)
  let newStack = '';
  // console.log(oldStack.clean())

	for (const line of oldStack.items) {
		// Discard internal code
		if (line.file.includes("/cjs"))
			continue;
		if (line.thirdParty && line.file.includes("/node_modules/vm2/"))
			continue;
		if (line.callee == "Script.runInContext")
			continue;
		// Replace the default filename with the user-provided one
		if (line.fileName == "vm.js"){
			line.fileRelative = line.fileShort = line.fileName;
      newStack += `\n    at ${line.fileRelative}:${line.line}:${line.column}`;
    }

	}
  let e2 = Object.assign(e)
  e2.stack = e.stack.split('\n')[0]+newStack
  return e2
}



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class ScriptRuntime {
  constructor(collectionVariables) {
    this.collectionVariables = collectionVariables
  }

  async runScript(script) {
    const context = {};
    const customLogger = (type) => {
      return (...args) => {
        console.log(type, ...args);
      };
    };
    context.console = {
      log: customLogger('log'),
      debug: customLogger('debug'),
      info: customLogger('info'),
      warn: customLogger('warn'),
      error: customLogger('error')
    };
    context.collectionVariables = this.collectionVariables

    const vm = new NodeVM({
      sandbox: context,
      prettyErrors: true,
      require: {
        context: 'sandbox',
        external: true,
        builtin: ['path', 'stream', 'util', 'url', 'http', 'https', 'zlib','fs','assert','events'],
        // import: ['axios'],
        mock: {
          axios,
          chai
        }
      }
    });
    const asyncFunction = vm.run(`module.exports = async () => {${script}}`, path.join(__dirname, 'vm.js'));

    try {
      await asyncFunction();
    } catch (err) {
      console.log(convertToVMStackError(err))
    }

  }
}

(async () => {
  let collectionVariables = {
    yes:'no'
  }
  const code = `const chai = require('chai')
    chai.config.truncateThreshold = 0;
    let foo = true
    console.log(collectionVariables)
    collectionVariables.yes = 'yes'
    // chai.assert.typeOf(foo, 'string')
    `;
  let runner = new ScriptRuntime(collectionVariables);
  await runner.runScript(code);
  console.log(runner.collectionVariables)


  const code2 = `
  collectionVariables.yes = 'sure'
  `;
  await runner.runScript(code2);
  console.log(runner.collectionVariables)
})();