import OpenAI from 'openai'
import fs from 'fs';
import {default as fetch, Response } from 'node-fetch';
import crypto from 'crypto';
import { Readable, PassThrough } from 'stream';







// dotenv.config()
const openaiProxy = (app) => {
  const openai = new OpenAI({
    apiKey: app.get('openai').key,
    fetch: async (url, options) => {
      const md5 = crypto.createHash('md5');
      md5.update(url + JSON.stringify(options.body)+app.get('openai').key,);
      let cachePath = `${app.get('openai')?.cachePath || './cache'}`
      const cacheKey = `${cachePath}/${md5.digest('hex')}`;

      // Create the folder if it doesn't exist
      if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, { recursive: true });
      }

      let response
      try {
        const cachedData = await fs.promises.readFile(cacheKey, 'utf8');
        console.log('Returning cached response:', cachedData);

        if(cachedData.indexOf('data:', 1)){
            const data = cachedData.split('data:').slice(1)
                .map(item => 'data:' + item)
                .map(str => str.trim()) // remove leading/trailing whitespace
                .map(str => {
                    try {
                        // Try to parse as JSON
                        return JSON.parse(str.slice(5));
                    } catch(err) {
                        // If parsing fails, return the original string
                        return str.slice(5).trim()
                    }
                });

              async function* generate() {
                  for await (const item of data) {
                      yield typeof item === 'object' ? JSON.stringify(await item) : item;
                  }
              }
              const readable = Readable.from(generate());
              
              // for await (let chunk of readable){
              //   console.log(chunk)
              // }

            return readable
              

            return new Response(readable);





        }

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
        let stream1 = new PassThrough();
        let stream2 = new PassThrough();
        response.body.pipe(stream1).pipe(stream2);
      

        const chunks = [];
        for await (const chunk of stream1) {
          chunks.push(chunk);
        }
        const decodedText = Buffer.concat(chunks).toString('utf8');
        await fs.promises.writeFile(cacheKey, decodedText, 'utf8');
  
        return new Response(stream2, response);
  
  
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