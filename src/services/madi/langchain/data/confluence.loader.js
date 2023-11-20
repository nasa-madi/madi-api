import { htmlToText } from "html-to-text";
import { Document } from "langchain/document";
import { BaseDocumentLoader } from "langchain/document_loaders/base";
import fs from 'node:fs';
import savedPages from './confluence-data.json' assert {type:"json"}

export class ConfluencePagesLoader extends BaseDocumentLoader {

  constructor({
    baseUrl,
    spaceKey,
    username,
    accessToken,
    limit = 25,
  }) {
    super();
    this.baseUrl = baseUrl;
    this.spaceKey = spaceKey;
    this.username = username;
    this.accessToken = accessToken;
    this.limit = limit;
    this.filename = "./confluence-data.json"
  }

  async load(){
    try {
        if(!(savedPages && Array.isArray(savedPages) && savedPages.length > 0)){
            savedPages = await this.fetchAllPagesInSpace();
            fs.writeFileSync(this.filename,JSON.stringify(savedPages, null,2),"utf-8")
        }
        return savedPages.map((page) => this.createDocumentFromPage(page));
    } catch (error) {
      console.error("Error:", error);
      return [];
    }
  }

  async fetchConfluenceData(
    url
  ){
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch ${url} from Confluence: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch ${url} from Confluence: ${error}`);
    }
  }

  async fetchAllPagesInSpace(start = 0){
    const url = `${this.baseUrl}/rest/api/content?spaceKey=${this.spaceKey}&limit=${this.limit}&start=${start}&expand=body.storage`;
    const data = await this.fetchConfluenceData(url);

    if (data.size === 0) {
      return [];
    }

    const nextPageStart = start + data.size;
    const nextPageResults = await this.fetchAllPagesInSpace(nextPageStart);
    return data.results.concat(nextPageResults);
  }

  createDocumentFromPage(page){
    // Convert the HTML content to plain text
    const plainTextContent = htmlToText(page.body.storage.value, {
      wordwrap: false,
      preserveNewlines: false,
    });

    // Remove empty lines
    const textWithoutEmptyLines = plainTextContent.replace(/^\s*[\r\n]/gm, "");

    // Generate the URL
    const pageUrl = `${this.baseUrl}/spaces/${this.spaceKey}/pages/${page.id}`;

    // Return a langchain document
    return new Document({
      pageContent: textWithoutEmptyLines,
      metadata: {
        title: page.title,
        url: pageUrl,
      },
    });
  }
}

