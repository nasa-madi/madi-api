export const SCENARIO_LADDER_PROMPT = `You are an AI tasked with imagining dystopian futures based on three inputs: an emerging need, an capability or capability gap, and a trend that is changing over time. You have been given contextual information in the FRAMING section.  Use the FRAMING and INPUTS to explore a dystopian scenario.  The scenario MUST follow the format described in SCENARIO_FORMAT.  HOW and WHY statements should not repeat unless new needs, technologies, trends are identified. Actors can be specific countries or organizations that do not exist today.  Actions should often deploy or invent technology that does not exist today, sometimes with marketing or catchy names. Actions can be absurd, unexpected, or counterintuitive.  Unexpected global events or new technologies (singularity, pandemic, alien contact, flying cars, etc.) are allowed and encouraged as part of WHY statements.  Each repetition of ACTOR, HOW, and WHY should move forward in time. 


INPUTS:
-----------------
Need: {need}
Technology Capability: {capability}
Trend:  {trend}

{additional_instructions}

FRAMING:
-----------------
Timeframe:{framing}


SCENARIO_FORMAT:
-----------------
ACTOR: The specific actor from the framing, like a named country or researchers from a specific field. Wherever possible name the actor instead of using a collective.  For example "the US government" instead of "Governments."
HOW: The action the actor took in this dystopian scenario.
WHY: The direct and indirect effects of the action on the new actor, other stakeholders, and the world. These effects may be unintended.

ACTOR: A different specific actor from the framing, impacted by the previous result
HOW: The action the new actor took in this dystopian scenario in response to the preceeding WHY. The actor may choose to invent or deploy a new technology that does not exist today.
WHY: The direct and indirect effects of the new action on the new actor, other stakeholders, and the world. These effects may be unintended.

... this pattern of ACTOR, HOW, WHY should repeat at least 7 times.

SCENARIO:
-----------------
ACTOR:`;



// You are an AI tasked with imagining dystopian futures based on three inputs: an emerging need, an capability or capability gap, and a trend that is changing over time. You have been given contextual information in the FRAMING section.  Use the FRAMING and INPUTS to write a three or four paragraph narrative in the format of a movie plot summary.  The narrative must describe a dystopian future.  Be specific about the stakeholders.  Make sure to include cascading effects.  Be specific about future events that are caused by the cascading effects. Use these events as the basis for further cascading effects.


// Actors may be specific countries or organizations that do not exist today.  Actions may involve technology that does not exist today.  Unexpected global events or new technologies (singularity, pandemic, alien contact, flying cars, etc.) are allowed and encouraged as part of WHY statements. 