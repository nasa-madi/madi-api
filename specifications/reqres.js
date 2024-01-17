import yaml from 'js-yaml'
import fs from 'fs'
import { flatten } from 'flat'
import axios from 'axios'
// import { getQuickJS } from "@tootallnate/quickjs-emscripten"
import esbuild from 'esbuild'




import vm from 'node:vm'

const contextifiedObject = vm.createContext({
    secret: 42,
    print: console.log,
  });
  
  (async () => {
    // Step 1
    //
    // Create a Module by constructing a new `vm.SourceTextModule` object. This
    // parses the provided source text, throwing a `SyntaxError` if anything goes
    // wrong. By default, a Module is created in the top context. But here, we
    // specify `contextifiedObject` as the context this Module belongs to.
    //
    // Here, we attempt to obtain the default export from the module "foo", and
    // put it into local binding "secret".
  
    const bar = new vm.SourceTextModule(`
      import s from 'foo';
      s;
      print(s);
    `, { context: contextifiedObject });
  
    // Step 2
    //
    // "Link" the imported dependencies of this Module to it.
    //
    // The provided linking callback (the "linker") accepts two arguments: the
    // parent module (`bar` in this case) and the string that is the specifier of
    // the imported module. The callback is expected to return a Module that
    // corresponds to the provided specifier, with certain requirements documented
    // in `module.link()`.
    //
    // If linking has not started for the returned Module, the same linker
    // callback will be called on the returned Module.
    //
    // Even top-level Modules without dependencies must be explicitly linked. The
    // callback provided would never be called, however.
    //
    // The link() method returns a Promise that will be resolved when all the
    // Promises returned by the linker resolve.
    //
    // Note: This is a contrived example in that the linker function creates a new
    // "foo" module every time it is called. In a full-fledged module system, a
    // cache would probably be used to avoid duplicated modules.
  
    async function linker(specifier, referencingModule) {
      if (specifier === 'foo') {
        return new vm.SourceTextModule(`
          // The "secret" variable refers to the global variable we added to
          // "contextifiedObject" when creating the context.
          export default secret;
        `, { context: referencingModule.context });
  
        // Using `contextifiedObject` instead of `referencingModule.context`
        // here would work as well.
      }
      throw new Error(`Unable to resolve dependency: ${specifier}`);
    }
    await bar.link(linker);
  
    // Step 3
    //
    // Evaluate the Module. The evaluate() method returns a promise which will
    // resolve after the module has finished evaluating.
  
    // Prints 42.
    await bar.evaluate();
  })();
// let outer = {}
// let str = `
//     import { flatten } from 'flat'
//     // const flatten = require('flat')
//     console.log(flatten)
//     let output = flatten({yes:{this:{is:"flat"}}})
//     outer.output = output
// `
// vm.runInThisContext(str) // hello from the vm 













// import 'ses';
// import { importLocation } from "@endo/compartment-mapper";
// import { StaticModuleRecord } from '@endo/static-module-record';
// export const makeImporter = (locate, retrieve) => async moduleSpecifier => {
//     const moduleLocation = locate(moduleSpecifier);
//     const string = await retrieve(moduleLocation);
//     return new StaticModuleRecord(string, moduleLocation);
//   };

// // lockdown();
// let outer = {}
// let str = `()=>{
//     // import { flatten } from 'flat'
//     const flatten = require('flat')
//     console.log(flatten)
//     let output = flatten({yes:{this:{is:"flat"}}})
//     outer.output = output
// }`
// // Function(str)
// (1,eval)(str)
// console.log(outer)









// import ivm from 'isolated-vm'

// const isolate = new ivm.Isolate({ memoryLimit: 128 });
// const context = isolate.createContextSync();
// const jail = context.global;
// jail.setSync('global', jail.derefInto());
// // This makes the global object available in the context as `global`. We use `derefInto()` here
// // because otherwise `global` would actually be a Reference{} object in the new isolate.
// jail.setSync('global', jail.derefInto());

// // We will create a basic `log` function for the new isolate to use.
// jail.setSync('log', function(...args) {
// 	console.log(...args);
// });

// function stringifyFunc(libraryName) {
//     return new Promise((resolve, reject) => {
//       esbuild.build({
//         entryPoints: [`node_modules/${libraryName}/index.js`],
//         bundle: true,
//         minify: true,
//         write: false
//       }).then(result => {
//         resolve(result.outputFiles[0].text);
//       }).catch(reject);
//     });
//   }

// let lib = stringifyFunc('flat').then(console.log).catch(console.error);
// console.log(lib)




// let str = `
//     const flatten = ${lib}
//     log(flatten)
//     let output = flatten({yes:{this:{is:"flat"}}})
//     // log(output)
// `
// context.evalSync(str);









// async function main() {
//     const QuickJS = await getQuickJS()
//     const vm = QuickJS.newContext()
    
//     // Add 'flatten' function to the VM context's global scope
//     const globalObj = vm.global;
//     globalObj.setProp('flatten', vm.newFunction('flatten', flatten));
//     const result = vm.evalCode(`let output = flatten({yes:{this:{is:"flat"}}}); output;`);


//     console.log(result.toString());
    
//     globalObj.dispose();
//     result.dispose();
//     vm.dispose();

//     // vm.setModuleLoader((moduleName) => `export default '${moduleName}'`)
//     // const promise = vm.evalCodeAsync(`
//     //     import { flatten } from 'flat'
//     //     let output = flatten({yes:{this:{is:"flat"}}})
//     //     console.log(output)
//     // `)
//     // vm.dispose()
//   }
  
//   main()


// And let's test it out:
// context.evalSync('log("hello world")');
// > hello world


// Object(eval)(str)
// console.log(output)





async function sendRequestsFromOpenApiSpec(spec) {

    let reqs = []
    for (const path in spec.paths) {
        for (const method in spec.paths[path]) {
            const route = `${spec.servers[0].url}${path}`;
            const parameters = spec.paths[path][method].parameters || [];
            const headers = parameters
                .filter(param => param.in === 'header')
                .reduce((acc, curr) => ({ ...acc, [curr.name]: curr.example }), {});
            const params = parameters
                .filter(param => param.in === 'query')
                .reduce((acc, curr) => ({ ...acc, [curr.name]: curr.example }), {});
            
            if(spec.paths[path][method].requestBody){
                for (const req in spec.paths[path][method].requestBody.content['application/json'].examples){
                    let value = spec.paths[path][method].requestBody.content['application/json'].examples[req].value
                    headers: 
                    reqs.push({
                        options: { method, url: route, headers, params, data: value },
                    })
                    // console.log()
                }   
            }else{
                reqs.push({
                    options: { method, url: route, headers, params },
                })
            }
 
            console.log(reqs)
            // try {
            //     const response = await axios({ method, url: route, headers, params });
            //     console.log({
            //         resquest: { method, url: route, headers, params },
            //         reponse: response.data
            //     })
            // } catch (error) {
            //     console.error(error);
            // }
        }
    }
}



// Get document, or throw exception on error
try {
  const spec = yaml.load(fs.readFileSync('./specifications/openapi/_merged.yml', 'utf8'));
//   let flat = flatten(spec)
//   sendRequestsFromOpenApiSpec(spec);


  



//   let path_keys = Object.keys(flat).filter(f=>f.startsWith('paths'))


//   let pair_keys = Object.keys(flat).filter(k=>k.includes('x-ReqRes'))
//   let req_keys = pair_keys.map(k=>{
//     return { 
//         req: k.split('.').pop(),
//         res: flat[k]
//     }
//   })
  

//   console.log(pair_keys)
//   console.log(req_keys)

//   console.log(flat)
} catch (e) {
  console.log(e);
}