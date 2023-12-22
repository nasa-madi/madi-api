import openai from "../utils/cacheProxy.js";



// /*******************************
//  * MERGING
//  *******************************/
// import pkg from 'lodash';
// const { set, get } = pkg;
// const deltaPaths = ['choices[0].delta'];
// const concatenatedPaths = ['choices[*].content', 'choices[*].tool_calls[*].function.arguments'];
// const streamPrintPath = 'choices[0].delta.content'
// function setDeltaProp(delta, deltaParentPath, response, concatenatedPaths, index, key) {
//     const deltaProp = delta[key];
//     const newConcatPaths = concatenatedPaths.map((v) => v.replace('[*]', `[${index}]`));
//     const currentProp = get(response, deltaParentPath);

//     if (Array.isArray(deltaProp)) {
//         deltaProp.forEach(({ index, ...rest }) => {
//             Object.keys(rest).forEach(key =>
//                 setDeltaProp(rest, `${deltaParentPath}[${index}].${key}`, response, newConcatPaths, index, key));
//         });
//     } else if (deltaProp && newConcatPaths.includes(deltaParentPath)) {
//         set(response, deltaParentPath, (currentProp || '') + deltaProp);
//     } else if (typeof deltaProp === 'object' && deltaProp !== null) {
//         Object.keys(deltaProp).forEach(key =>
//             setDeltaProp(deltaProp, `${deltaParentPath}.${key}`, response, newConcatPaths, index, key));
//     } else {
//         set(response, deltaParentPath, deltaProp);
//     }
// }

// export function handleDeltas(object, response) {
//     const delta = get(object, deltaPaths[0]);
//     const deltaParentPath = deltaPaths[0].slice(0, -6);

//     if (delta) {
//         Object.keys(delta).forEach(key => setDeltaProp(delta, `${deltaParentPath}.${key}`, response, concatenatedPaths, 0, key));
//     }
//     return response
// }










export const makeRequest = async (options)=>{
  return openai.chat.completions.create(options);
}




// export const processConversation = async (conversation, tools, tool, writeFunc) => {

//   let options = {
//     model: 'gpt-4-1106-preview',
//     stream: true,
//     messages:conversation, 
//     tools, 
//     tool_choice: tool
//   }
//   // if its use local, then you need to run call Tools
//   options.tools = Object.values(availableTools)
//   let response = await makeRequest(options)
//   let mergeObject = {}
//   if(options.stream){
//     for await (const chunk of response) {
//       mergeObject = handleDeltas(chunk, mergeObject)
//       writeFunc(chunk)
//     }
//     conversation.push(mergeObject.choices[0])
//   }else{
//     mergeObject = response
//     writeFunc(mergeObject)
//   }


//     let functionResults = await callTools(mergeObject.choices[0].tool_calls);
//     if (functionResults.length) {
//       conversation.push(...functionResults)
//       conversation = await processConversation(conversation, tools, tool, writeFunc)
//     }
//   return conversation
// };



export class ChatService {
  constructor(options) {
    this.options = options
  }


  async create(data, params) {
    console.log('\n\n************ CHAT SERVICE CREATE')
    console.log("model: ", data.model)
    console.log("messages: ",data.messages)
    console.log("tool_choice: ",data.tool_choice || "auto")
    // console.log("tools: ", availableToolDescriptions)
    let { messages, tools, tool_choice } = data
    let options = {
      model: 'gpt-4-1106-preview',
      stream: params?.query?.stream === 'false' ? false:true,
      messages, 
      tools, 
      tool_choice
    }
    // return data
    return makeRequest(options)
    // let writeFunc = (text)=>console.log(text)
    // return await processConversation(messages, tools, tool_choice, writeFunc)
  }
}

export const getOptions = (app) => {
  return { app }
}
