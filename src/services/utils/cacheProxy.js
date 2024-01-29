import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import fs from 'fs';
import {default as fetch, Response } from 'node-fetch';
import crypto from 'crypto';

// dotenv.config()
const openaiProxy = (app) => {
  const openai = new OpenAI({
    apiKey: app.get('openai').key,
    fetch: async (url, options) => {
      const md5 = crypto.createHash('md5');
      md5.update(url + JSON.stringify(options.body));
      const cacheKey = `./cache/${md5.digest('hex')}`;

      try {
        const cachedData = await fs.promises.readFile(cacheKey, 'utf8');
        console.log('Returning cached response:', cachedData);

        return new Response(cachedData, {});
      } catch (error) {
        const response = await fetch(url, options).catch((e) => {
          console.error(e);
        });

        const responseClone = response.clone();
        const requestBody = JSON.parse(options.body);
        
        if (requestBody && requestBody.stream && responseClone.body) {
          const chunks = [];
          for await (const chunk of responseClone.body) {
            chunks.push(chunk);
          }
          const decodedText = Buffer.concat(chunks).toString('utf8');
          await fs.promises.writeFile(cacheKey, decodedText, 'utf8');
        } else {
          const responseBody = await responseClone.json();
          await fs.promises.writeFile(cacheKey, JSON.stringify(responseBody), 'utf8');
        }

        return response;
      }
    },
  });

  return openai;
};


export const openaiConfig = (app)=>{
    let openai;
    if(app.get('openai').use_proxy){
        console.log('Cache Enabled')
        openai = openaiProxy(app)
    }else{
        console.log('Cache Disabled')
        const openaiNormal = new OpenAI({
          apiKey: app.get('openai').key
        })
        openai = openaiNormal
    }
    app.openai = openai
}

export default openaiConfig