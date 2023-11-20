import { createClient } from "redis";
import { Debug } from './logger.js';
import * as dotenv from 'dotenv'

dotenv.config()
const debug = Debug(import.meta.url);

export let redisClient

(async ()=>{
    if(!redisClient){
        redisClient = createClient({
            url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
        });
        redisClient.on('error', err => console.log('Redis Client Error', err));
    
        redisClient.on('ready', () => {
            debug("Client connected.");
        });
    }
})();

