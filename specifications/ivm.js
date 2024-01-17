import yaml from 'js-yaml'
import fs from 'fs'
import { flatten } from 'flat'
import axios from 'axios'
import esbuild from 'esbuild'
import ivm from 'isolated-vm'

const isolate = new ivm.Isolate({ memoryLimit: 128 });
const context = isolate.createContextSync();
const jail = context.global;
jail.setSync('global', jail.derefInto());

jail.setSync('log', function(...args) {
  console.log(...args);
});

let sharedState = {};

jail.setSync('sharedState', new ivm.Reference(sharedState));

async function stringifyFunc(libraryName) {
  try {
    const result = await esbuild.build({
      entryPoints: [`node_modules/${libraryName}/index.js`],
      bundle: true,
      minify: true,
      write: false,
      banner: { js: '//comment' },
      format: 'cjs',
      globalName: libraryName
    });
    return result.outputFiles[0].text;
  } catch (error) {
    console.error(error);
  }
}

const code = `
  // import { flatten } from 'flat';
  import chai from 'chai';
`
//something from './something';`;
const module = await isolate.compileModule(code);
const dependencySpecifiers = module.dependencySpecifiers;
console.log(dependencySpecifiers)

await module.instantiate(context, specifier => {
  // console.log(specifier)
  // return import(specifier)
  throw new Error(`Missing module: ${specifier}`)
})
await module.evaluate();

// context.evalSync(`
// let output = flat.flatten({yes:{this:{is:"flat"}}});
// log(output);
// `);














// // dependencySpecifiers => ["./something"];

// let libs = ['flat', 'chai']
// async function execute(state, paramCode) {
//   sharedState = {...sharedState, ...state};

//   let str = '';
//   for (const lib of libs) {
//     let libStr = await stringifyFunc(lib);
//     str += `
//       const __${lib} = {exports:{}};
//       ((module) => {
//         ${libStr}
//       })(__${lib});
//       const ${lib} = __${lib}.exports;\n`;
//   }
  
//   // Set sharedState inside the VM
//   str += `let sharedState = ${JSON.stringify(sharedState)};\n`;

//   // Append the paramCode and update sharedState inside the VM
//   str += `${paramCode}
//     sharedState = JSON.stringify(sharedState);
//   `;

//   await context.eval(str);

//   // Get updated sharedState from the VM
//   // sharedState = JSON.parse(await context.eval('sharedState').then(result => result.derefInto()));


//   context.dispose();
//   return sharedState;


// }

// // Usage
// execute(
//   {myState: "This is my state"},
//   `
//     let output = flat.flatten({yes:{this:{is:"flat"}}});
//     log(output);
//     sharedState.myState = output;
//   `
// ).then(updatedState => {
//   console.log(updatedState);
// });