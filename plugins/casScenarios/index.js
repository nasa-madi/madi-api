import { BasePlugin } from 'madi-plg-base-class'
/**
 * Class representing the SemanticScholar plugin.
 */
const TOOLNAME = 'create_cas_scenario'

export class Plugin extends BasePlugin {

  /**
   * Create a CAS Scenario plugin.
   * @param {PluginOptions} [options] - The plugin options.
   */
  constructor(options) {
    super({
      ...options,
      description
    })
  }

  /**
   * Run the CAS Scenario operation.
   * @param {RunOptions} options - The options for the search operation.
   * @returns {Promise<string>} - The search results in string format.
   */
  async run() {
    return {content: scenariosPrompt}
  }
}


const FORMAT_INSTRUCTIONS = `
  \n\nINSTRUCTIONS:\n For all responses in this conversation your answer must be in json in the form {"response":<YOUR RESPONSE>,"proceed":<boolean>}.  If there is insufficient information to complete the stage, the proceed boolean must be set to false. The response will then be sent directly to the user to add more information in their request.  If there IS enough information, proceed must be set to true.  The "response" field in the answer must NOT be JSON.  It should be in Markdown with proper spacing and line breaks.\n\n
  `


// The static description object for the Semantic Scholar search tool.
export const description = {
  type: 'function',
  plugin: 'CAS Discovery',
  // Identifier for the plugin
  display: 'Scenario Creation',
  // Display name for the UI
  function: {
    name: TOOLNAME,
    description: 'Generate a scenario using CAS\'s futurist scenario creation tool.  The tool is a complex prompt that goes through several steps in order to output a rich futuristic scenario.',
    parameters: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'The topic that the futurist scenario should be about. Can be a whole article or simply a few key words.'
        },
        timeline: {
          type: 'string',
          description: 'How far in the future the scenario should imagine.  Defaults to 2050.'
        },
        need: {
          type: 'string',
          description: 'The specific need facing humanity or industry that the scenario should be addressing.'
        },
        capability: {
          type: 'string',
          description: 'The technical capability that is new or emerging or being applied in a new way that the scenario should be focused on.'
        },
        trend: {
          type: 'string',
          description: 'A macro trend, good or bad, that is pointing towards a future crisis or capability or change that the scenario should also include.'
        }
      },
      required: ['topic']
    }
  }
};

const scenariosPrompt = `
You are an A.I. assistant with expert skill in strategic foresight and scenario development.  You will follow the four stages of analysis below.

## STAGE 1: "Basic Analysis" 
Analyze an article I will provide and extract the trend, need, and capability described in it. If there is no article, extrapolate based on the topic provided.  The user may provide a topic that the futurist scenario should be about that can be a whole article or simply a few key words.'

## STAGE 2: "Context Building" 
Provide explanations or ideas for the following contextual information: 
  - Timeframe: The period should be in the future, after 2050. 

  - Context: Reflect on societal, technological, and environmental influences that shape the dystopian world. 

  - Core Problem: Identify the main issue or challenge arising from the need, capability gap, and trend, which may involve a specific technological development, social change, environmental crisis, or other factors. 

  - Cause and Effect: Explore what leads to the core problem and the consequences, considering both immediate and long-term effects. 

  - Stakeholders: Determine who is directly affected by the problem. These could be individuals, groups, organizations, or even nations. Examine their motivations and interests, and how they respond to the problem. 

  - Amplifying Factors: Identify additional factors that worsen the problem or make it harder to solve. 

  - Cascading Effects & Interconnections: Look at how the core problem and its challenges have ripple effects across different sectors of society and relate to existing problems, creating a complex network of challenges. 

  - Human Impact: Examine the human experience in this scenario. Understand the emotions, struggles, moral, and ethical implications faced by individuals and communities.  


## STAGE 3: "How/Why Laddering"
Write out key events based on the following ACTOR/HOW/WHY format.  Continue with this ACTOR - HOW - WHY pattern at least seven times. Each repetition should move the timeline forward, maintaining the dystopian narrative.

  - ACTOR: Specify a stakeholder as the actor. This actor is based on your contextual understanding and initial analysis from the article. It can be a country or an organization that does not currently exist. Some actors should be existing organizations or existing stakeholders.  Pay particular attention to the list of stakeholders provided in Stage 2.

  - HOW: Describe an action that the actor takes in response to the dystopia identified in your initial analysis. This action should often deploy or invent a technology that does not exist today (it can even have a catchy, marketed name) and can be absurd, unexpected, or counterintuitive. 

  - WHY: Describe the direct and indirect effects of the action on the new actor and the dystopian world, keeping in mind these effects may be unintended. Unexpected global events or new technologies are allowed and encouraged as part of these effects. 

## STAGE 4: "The Narrative"
Based on the ACTOR/HOW/WHY events above, rewrite the chain of events into an narrative. This narrative must be at least four paragraphs long, detailing specific actors, their actions, and the subsequent consequences.  The narrative should not use flowery language but should be professional and thoughtful.
`



async function runAsSteps({data}, params){
  const { topic, timeline, need, capability, trend } = data;

  if (!topic) {
    return { "content": "As there is no topic information provided to analyze, I'm unable to complete STAGE 1 of the process, which involves extracting a trend, need, and capability described in the specified article. Please provide an article or more information for analysis, and I will gladly assist with scenario development." }
  }

  const messages = [
    { "role": "system", "content": scenariosPrompt + '\n\n' + FORMAT_INSTRUCTIONS },
  ];

  const stages = [
    `## STAGE 1:\nAnalyze the following article:\n\n${topic}`,
    `## STAGE 2:\nProvide explanations or ideas for the following contextual information:\n\n- Timeframe: ${timeline || '2050'}\n- Need: ${need || ''}\n- Capability: ${capability || ''}\n- Trend: ${trend || ''}`,
    `## STAGE 3:\nWrite out key events based on the ACTOR/HOW/WHY format as described in the initial prompt.`,
    `## STAGE 4:\nBased on the ACTOR/HOW/WHY events above, rewrite the chain of events into an enticing narrative, similar to a sci-fi movie summary. This narrative must be at least four paragraphs long, detailing specific actors, their actions, and the subsequent consequences.`
  ];

  let fullDocument = '';
  for (const stage of stages) {
    messages.push({ "role": "user", "content": stage });
    const completion = await this.makeRequest({
      messages,
      response_format: { "type": "json_object" },
      model: "gpt-4-turbo-preview",
    });

    try {
      const response = JSON.parse(completion.choices[0].message.content);
      if (!response.proceed || response.proceed === 'false') {
        return response;
      }
      messages.push({ "role": "assistant", "content": JSON.stringify(response.response) });
      fullDocument += response.response + '\n\n';
    } catch (e) {
      return { "content": 'There was an error completing your request. Try again.' };
    }
  }

  return { "content": fullDocument.trim() };
}