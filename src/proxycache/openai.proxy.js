// import express from 'express';
// import axios from 'axios';
// import crypto from 'crypto';
// import fs from 'fs/promises';
// // import { Debug } from '../utils/logger.js'
// import { logger } from '../logger.js';
// let debug = logger.debug
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // const debug = Debug(import.meta.url)
// const app = express();
// // const port = process.env.PROXY_PORT || 8888;
// let i = 0;

// app.use(express.json());

// // Use async file operations when accessing the file system

// app.all('*', async (req, res) => {
//   const url = `https://api.openai.com${req.url}`;
//   debug(url)
//   const hash = crypto.createHash('sha256').update(url + JSON.stringify(req.body)).digest('hex');
//   const timestamp = new Date().toISOString().slice(0,19).replace(/[TZ]/g, '_');
//   i++;
//   try {
//     const cachedFilePaths = await fs.readdir(`${__dirname}/cache/`);
//     const latestCachedFilePath = cachedFilePaths.find(filePath => filePath.includes(hash));
//     const cachedResponse = JSON.parse(await fs.readFile(`${__dirname}/cache/${latestCachedFilePath}`,'utf8'));

//     debug('Cached response found!');
//     return res.status(cachedResponse.status).json(cachedResponse.data);

//   } catch (error) {
//     debug('Making a fresh request...');
//     try {
//       const response = await axios({
//         url,
//         method: req.method,
//         data: req.body,
//         headers: {
//           "Content-Type": "application/json",
//           "User-Agent": "OpenAI/NodeJS/3.2.1",
//           Authorization: req.headers["authorization"],
//         },
//       });

//       const responseToCache = {
//         requestBody: req.body,
//         status: response.status,
//         data: response.data,
//         timestamp: timestamp
//       };
//       await fs.mkdir(`${__dirname}/cache/`, { recursive: true })
//       await fs.writeFile(`${__dirname}/cache/${timestamp}___${i}___${hash}.json`, JSON.stringify(responseToCache, null, 2));

//       return res.status(response.status).json(response.data);
//     } catch (error) {
//       logger.error('Error:', error.message);
//       return res.status(error.response.status).json(error.response.data);
//     }
//   }
// });

// export const initializeProxy = async (port, name="") => {
//   app.on('error', (e)=>{
//     logger.error(e)
//   });

//   await app.listen(port, () => logger.info(`${name} ProxyCache Server started on port ${port}...`))
// }
