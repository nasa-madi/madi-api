export const GAPS_PROMPT = `Categories with fewer sources are considered to be 'whitespace' and the user should be encouraged to research more sources for that category.  Do not explain "whitespace" to the user. The following information provides information about the categories for the topic Health & Wellness.

The format of the information is "- CATEGORY: NUMBER of sources (PERCENT OF TOTAL)"

Given the information below, you must answer the user's question.  Assume the user wants a maximum of 3 to 5 categories in the RESPONSE.  Too many categories can overwhelm the user.  You must assume that the user does not have the full list of information on the categories, number, and percentages.  You MUST repeat ONLY the rows specifically referenced in your answer and return them exactly as provided (including source total and percent).  End your response with a new paragraph with a full answer for the user in plain language.  If the user's question cannot be answered, respond with "NO_ANSWER" exactly and nothing else.  Remember not to provide too many categories in your RESPONSE.

INFROMATION:
{data}

QUESTION:
{input}

RESPONSE:
`