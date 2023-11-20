import { PlaywrightWebBaseLoader } from "langchain/document_loaders/web/playwright";
import { extractFromHtml } from '@extractus/article-extractor'
import { getIdFromText } from "../../utils/text.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const loader = (options) => {
    let url = options?.url;

    return new PlaywrightWebBaseLoader(
        url,
        {
            launchOptions: {
                headless: true,
            },
            gotoOptions: {
                waitUntil: "domcontentloaded",
            }
        }
    )
};

export const playwrightScraper = async(url) => {
    let hash = getIdFromText(url);
    let page;
    let filename = `./cache/pw_${hash}.json`
    try {
        page = await fs.readFile(filename, 'utf8');
    } catch (error) {
        if (error.code === 'ENOENT') {
            const docs = await loader({url}).load();
            let result = await extractFromHtml(docs[0].pageContent, docs[0].metadata.source, {
                allowedTags: [
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'sup', 'sub',
                    'div', 'p', 'article', 'blockquote', 'section',
                    'pre', 'code',
                    'ul', 'ol', 'li', 'dd', 'dl',
                    'table', 'th', 'tr', 'td', 'thead', 'tbody', 'tfood',
                    'fieldset', 'legend',
                    'figure', 'figcaption', 'img',
                    'br',
                    'label',
                    'abbr',
                    'a',
                  ],
                  allowedAttributes: {
                    a: ['href', 'title'],
                    abbr: ['title'],
                    img: ['src', 'alt', 'title']
                  },
            });
            await fs.writeFile(__dirname+"/"+filename, JSON.stringify(result));
            return result;

        } else {
            console.log(error);
            return null;
        }
    }

    return page ? JSON.parse(page) : null;
}
