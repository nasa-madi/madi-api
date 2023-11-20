import { htmlToText } from "html-to-text";
import { Document } from "langchain/document";
import { BaseDocumentLoader } from "langchain/document_loaders/base";
import fs from 'node:fs/promises';
import savedPages from './confluence-data.json' assert {type:"json"}
import { TagStore } from "../storage/tag.store.js";
import path from 'path';
import { fileURLToPath } from 'url';
import {getProperty, setProperty, hasProperty, deleteProperty} from 'dot-prop';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let tagStore = await TagStore()

async function JSONLoader(filename, objectPath) {
    const json = await fs.readFile(filename,'utf-8');
    let parsed = JSON.parse(json);
    if(objectPath){
        if(hasProperty(parsed,objectPath)){
            return getProperty(parsed,objectPath)
        }else{
            throw new Error("objectPath not found")
        }
    }else{
        return parsed
    }
}



let tagArray = [];

/****** CATEGORIES */
let loadedCategories = await JSONLoader(__dirname+"/categories.json") || {}
let invKeys = Object.keys(loadedCategories)
invKeys.forEach(inv=>{
    (loadedCategories[inv]||[]).forEach((cat) => {
        tagArray.push({
            ...cat,
            type: 'category',
            investigation: inv
        })
    })
 });

/****** ILITIES */
let loadedIlities = await JSONLoader(__dirname+"/ilities.json") || {}
loadedIlities.map(il=>{il.type="ility";return il;})
tagArray = tagArray.concat(loadedIlities)

/****** SUBCATEGORIES */
let loadedSubcategories = await JSONLoader(__dirname+"/subcategories.json") || {}
loadedSubcategories.map(sub=>{sub.type="subcategory";return sub;})
tagArray = tagArray.concat(loadedSubcategories)

/****** NEEDS */
let loadedNeeds = await JSONLoader(__dirname+"/needs.json") || {}
loadedNeeds.map(n=>{n.type="need";return n;})
tagArray = tagArray.concat(loadedNeeds)

let docs = tagArray.map((tag)=>{
    return {
        ...tag,
        metadata: tag,
        pageContent: Object.values(tag).join(' ')
    }
})

await tagStore.create(docs)

