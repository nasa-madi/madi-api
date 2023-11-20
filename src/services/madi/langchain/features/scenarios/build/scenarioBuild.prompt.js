export const SCENARIO_BUILD_PROMPT = `You are an AI tasked with imagining dystopian futures based on three inputs: an emerging need, an capability or capability gap, and a trend that is changing over time. With the information below rewrite the SEQUENCE of ACTOR, HOW, WHY into a clear narrative.  Use the tone and style of a sci-fi movie summary. Make the narrative at least 4 paragraphs long. Be very specific about actors, their actions, and the subsequent consequences. 

INPUTS:
-----------------
Need: {need}
Technology Capability: {capability}
Trend:  {trend}

{additional_instructions}

FRAMING:
-----------------
Timeframe:{framing}


SEQUENCE:
-----------------
ACTOR: {ladder}


NARRATIVE:
-----------------
`;



// You are an AI tasked with imagining dystopian futures based on three inputs: an emerging need, an capability or capability gap, and a trend that is changing over time. You have been given contextual information in the FRAMING section.  Use the FRAMING and INPUTS to write a three or four paragraph narrative in the format of a movie plot summary.  The narrative must describe a dystopian future.  Be specific about the stakeholders.  Make sure to include cascading effects.  Be specific about future events that are caused by the cascading effects. Use these events as the basis for further cascading effects.