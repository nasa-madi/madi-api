import * as dotenv from 'dotenv'
dotenv.config()
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";
import { Debug } from '../../../utils/logger.js';
import { parseBoolean } from "../../../utils/boolean.js";
import { Configuration, OpenAIApi } from 'openai';
import { IMAGE_PROMPT } from "./images.prompt.js";
import { BaseOutputParser } from "langchain/schema/output_parser";
import fs from 'fs/promises';
import axios from 'axios';
import http from 'http';
const debug = Debug(import.meta.url)
import * as proxyCache from '../../../proxycache/proxycache.js'


const scenarioImagesPrompt = new PromptTemplate({
  template: IMAGE_PROMPT,
  inputVariables: ["narrative"],
});

class ImageParser extends BaseOutputParser{

  getFormatInstructions(){return ''}
  
  async parse(raw){
    const regexR = new RegExp(/(.*)Realistic:(.*?)(ELEMENT:|$)/gms)
    const regexA = new RegExp(/(.*)Artistic:(.*?)(ELEMENT:|$)/gms)
    const regexS = new RegExp(/(.*)Scifi:(.*?)(ELEMENT:|$)/gms)

    let matchesR = regexR.exec(raw);
    let matchesA = regexA.exec(raw);
    let matchesS = regexS.exec(raw);

    const realistic = matchesR[2].trim();
    const artistic = matchesA[2].trim();
    const scifi = matchesS[2].trim();


    return JSON.stringify({realistic, artistic, scifi})

  }
}


export class ScenarioImagePromptChain extends LLMChain{
    constructor(fields){
      fields.prompt = scenarioImagesPrompt
      fields.outputParser = new ImageParser()
      super(fields)
      this.llm = new OpenAI(
        { temperature: 0, 
          verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)},
        { basePath: process.env.PROXY_PATH}
      );
    }
}



export const ScenarioImages = async (promptObject) => {

  // Images creation
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    basePath: process.env.PROXY_PATH
  });

  const openai = new OpenAIApi(configuration);

  // const imageKeys = Object.keys(promptObject); //["realistic", "artistic", "scifi"]; //Add other keys as needed
  const imageKeys = Object.keys(promptObject); //["realistic", "artistic", "scifi"];
  const images = [];

  for (const key of imageKeys) {
    try {
        const imageObj = await openai.createImage({
            prompt: promptObject[key] + " NO TEXT",
            n: 1,
            size: "256x256"
        },{
          timeout:30000,   
          httpAgent: new http.Agent({ keepAlive: true })      
        });
        images.push({url: imageObj.data?.data[0]?.url, text:promptObject[key], key});
    } catch (error) {
        console.log(`Error fetching ${key} image: ${error}`);
    }
}

  const fileLocations = await Promise.all(images.map(async ({url, text, key}) => {
      const path = url.split('?')[0];
      const fileName = path.split('/').pop();
      const filePath = `./images/${fileName}`;

      // Check if the image already exists
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      const fullPath = `${process.env.BASE_PATH}images/${fileName}`;

      if (exists) {
          debug(`Image ${fileName} exists`);
          return `![${key}](${fullPath})`;
      } else {
        debug(`Fetching image ${fileName}...`);

          // If the image doesn't exist, fetch it with axios and save it
          const response = await axios({
              url,
              method: 'GET',
              responseType: 'arraybuffer'
          });
          await fs.writeFile(filePath, response.data);
          debug(`Image ${fileName} saved`);
          return `![${key}](${fullPath})`;
      }
  }));

  return fileLocations;
}


