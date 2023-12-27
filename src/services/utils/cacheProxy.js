import * as dotenv from 'dotenv'
import OpenAI from 'openai'
import fs from 'fs';
import {default as fetch, Response } from 'node-fetch';
import crypto from 'crypto';

dotenv.config()

let openai 
const openaiProxy = (app)=> new OpenAI({
  apiKey: app.get('openai').key,
  fetch: async (url, options)=>{

    const md5 = crypto.createHash('md5');
    md5.update(url + JSON.stringify(options.body));
    const cacheKey = `./cache/${md5.digest('hex')}`;

    return fs.promises.readFile(cacheKey, 'utf8')
    .then(data => {
      console.log('Returning cached response', data);

      return new Response(data,{
        headers: { 
          'Content-Type': 'application/json'
        },
      });

    })
    .catch(async err => {
      const response = await fetch(url, options).catch(e=>{
        console.error(e)
      })
      const response2 = response.clone();
      const responseBody = await response2.json()
      await fs.promises.writeFile(cacheKey, JSON.stringify(responseBody), 'utf8');
      return response
    })

  }
});

export const openaiConfig = (app)=>{
    // process.env.OPENAI_API_KEY = app.get('openai').key
    if(app.get('openai').use_proxy){
        // console.log('Cache Enabled')
        openai = openaiProxy(app)
    }else{
        // console.log('Cache Disabled')
        const openaiNormal = new OpenAI({
          apiKey: app.get('openai').key
        })
        openai = openaiNormal
    }
}

export default openai