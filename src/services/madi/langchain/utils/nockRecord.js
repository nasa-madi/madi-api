import { dirname, join } from "path";
import nock from "nock";
import * as stackTrace from "stack-trace";
import { Debug } from './logger.js'
import { getIdFromText } from "./text.js";
import { parseBoolean } from "./boolean.js";
const debug = Debug(import.meta.url)


function parentPath() {
  const trace = stackTrace.get();
  const currentFile = trace.shift().getFileName();
  const parentFile = trace
    .find(t => t.getFileName() !== currentFile).getFileName();
  const path = dirname(parentFile);
  return path.replace(/^file:\/\//, '') // Remove file:// from protocol on linux
}

export const recordOptions = {
  before:(scope)=>{
    scope.options = scope.options ?? {}
    scope.options.allowUnmocked = parseBoolean(process.env.NOCK_ALLOW_UNMOCKED)
    return scope
  }
}

export function setupRecorder(options = {}) {
  
  const nockBack = nock.back;
  
  const fixturePath = options.fixturePath || join(parentPath(), "__nock-fixtures__");
  nockBack.fixtures = fixturePath;

  nockBack.setMode(options.mode || process.env.NOCK_MODE || "record");

  return (fixtureName, options = recordOptions) =>
    nockBack(`${fixtureName}.json`, options).then(({ nockDone, context }) => {
        debug(`Starting ${fixtureName}`)
        return {
            completeRecording: ()=>{
                debug(`Closing ${fixtureName}`)
                nockDone();
            },
            ...context,
            assertScopesFinished: context.assertScopesFinished.bind(context)
        }
    });
}

// export const nockDecorator = (func)=>{
//   return async (...args) => {
//     let text = JSON.stringify(args)
//     console.log(func.name)
//     const { completeRecording } = await setupRecorder()(`${func.name}_${getIdFromText(text)}`);
//     let response = await func.apply(this, args);
//     completeRecording();
//     return response;
//   }
// }