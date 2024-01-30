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
      let response
      try {
        const cachedData = await fs.promises.readFile(cacheKey, 'utf8');
        console.log('Returning cached response:', cachedData);

        return JSON.parse(cachedData);
      } catch (error) {
        response = await fetch(url, options).catch((e) => {
          console.error(e);
        });
      }
      
      
      if (response.status !== 200) {
        const statusText = response.statusText
        const responseBody = await res.text()
        console.error(responseBody)
        throw new Error(
          `The OpenAI API has encountered an error with a status code of ${res.status} ${statusText}: ${responseBody}`
        )
      }

      let type = response.headers.get('content-type')
      if (type === 'text/event-stream') {
        const chunks = [];
        for await (const chunk of response.body) {
          chunks.push(chunk);
        }
        const decodedText = Buffer.concat(chunks).toString('utf8');
        await fs.promises.writeFile(cacheKey, decodedText, 'utf8');
        return response.clone()
      } else {
        const resJson = await response.json();
        await fs.promises.writeFile(cacheKey, JSON.stringify(resJson), 'utf8');
        return response.clone()
      }
      
    },
  });

  return openai;
};


export const openaiConfig = (app)=>{
    let openai;
    console.log(app.get('file'))
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