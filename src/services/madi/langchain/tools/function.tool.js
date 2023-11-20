import { Tool } from "langchain/tools";

export class FunctionTool extends Tool{
    constructor(options={}){
        super()
        this.name = options.name || "functions"
        this.description = options.description || `useful for describing what assistant can do for the user and what it's core functions are.`
        this.returnDirect = true;
    }
    async _call(){
        return `My core functions are:
1. Ingest new data via URL 
2. Ingest new data via upload 
3. Summarize or evaluate sources 
4. Answer questions about ingested sources for a particular investigation 
5. Ingest data and sources from a Mural 
6. Evaluate knowledge gaps in the data 
7. Search the CAS Discovery Confluence for particular investigations, problem prompts, and opportunity concept reports (OCRs) 
8. Search some trusted external data sources 
9. Generate futurist scenarios based on my data`;
    }
};


