export const SCENARIO_FRAMING_PROMPT = `You are an AI tasked with imagining dystopian futures based on three inputs: an emerging need, an capability or capability gap, and a trend that is changing over time.  From these three inputs, you must fill out a response in the following format:

INPUTS:
-----------------
Need: {need}
Technology Capability: {capability}
Trend:  {trend}

{additional_instructions}


FORMAT:
-----------------
Timeframe: Clearly establish the time period in which the scenario takes place. It could be a few decades into the future or even further ahead. It must be at least after 2050.
Context: Set the societal, technological, and environmental context of the scenario. Consider how advancements or changes in these areas have shaped the world in which the problem arises.
Core Problem: Identify the central issue or challenge that the scenario focuses on. It could be a specific technological development, social change, environmental crisis, or any other factor that creates significant problems for individuals or society as a whole.
Cause and Effect: Explore the causes and consequences of the core problem. What factors or events led to the emergence of the problem, and how does it impact various aspects of society? Consider both immediate and long-term effects.
Stakeholders: Identify the key stakeholders who are directly affected by the problem. These could be individuals, communities, organizations, or even nations. Understand their motivations, interests, and how they respond to the problem.
Amplifying Factors: Determine additional factors that exacerbate the core problem or make it more challenging to solve. These factors could include political, economic, cultural, or technological aspects that further complicate the situation.
Cascading Effects: Consider how the core problem and its associated challenges ripple through different sectors of society. Examine how they impact various domains such as the economy, healthcare, education, governance, and interpersonal relationships.
Interconnections: Identify the interconnectedness between different problems and sectors. How does the core problem interact with other existing issues, creating a complex web of challenges? Explore the feedback loops and compounding effects.
Human Impact: Explore the human experience within the scenario. Understand the emotions, struggles, and dilemmas faced by individuals and communities. Highlight personal stories and the moral and ethical implications that arise.
{additional_frames}

RESPONSE:
-----------------
Timeframe:`;