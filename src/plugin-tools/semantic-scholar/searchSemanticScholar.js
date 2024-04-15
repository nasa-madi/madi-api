import fetch from 'node-fetch';

export async function searchSemanticScholar({ data  }, params) {
  let {query} = data
  const fields = [
    'paperId',
    'url',
    'title',
    'venue',
    'publicationVenue',
    'year',
    'authors',
    'abstract',
    'publicationDate',
    'tldr'
  ].join(',');

  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
    query
  )}&fields=${fields}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    return JSON.stringify(data);
  } catch (error) {
    return JSON.stringify({ error: error.message });
  }
}
export const searchSemanticScholarDesc = {
  type: "function",
  plugin: "Semantic Scholar",
  display: "Search Semantic Scholar",
  function: {
    name: "searchSemanticScholar",
    description: "Search for academic papers from Semantic Scholar.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for papers, e.g. 'covid'",
        },
        limit: {
          type: "integer",
          description: "The maximum number of results to return (must be <= 100).",
          default: 100
        },
        publicationDateOrYear: {
          type: "string",
          description: "Restrict results to the given range of publication dates or years (inclusive). Accepts the format <startDate>:<endDate> where each term is optional, allowing for specific dates, fixed ranges, or open-ended ranges."
        },
        year: {
          type: "string",
          description: "Restrict results to the given publication year (inclusive)."
        },
        venue: {
          type: "string",
          description: "Restrict results by venue, including ISO4 abbreviations. Use a comma-separated list to include papers from more than one venue. Example: 'Nature,Radiology'."
        },
        fieldsOfStudy: {
          type: "string",
          description: "Restrict results to given field-of-study. Available fields include 'Computer Science', 'Medicine', 'Biology', etc."
        },
        offset: {
          type: "integer",
          description: "When returning a list of results, start with the element at this position in the list.",
          default: 0
        }
      },
      required: ["query"],
    },
  },
};
