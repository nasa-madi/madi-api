import { BasePlugin } from 'madi-plg-base-class'
/**
 * Class representing the SemanticScholar plugin.
 */
const TOOLNAME = 'scamper'

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
    return {content: scamperPrompt}
  }
}


// The static description object for the Scamper Analysis generation tool.
export const description = {
  type: 'function',
  plugin: 'CAS Discovery',
  // Identifier for the plugin
  display: 'Scamper Analysis',
  // Display name for the UI
  function: {
    name: TOOLNAME,
    description: 'Generate a SCAMPER Analysis. The tool produces a creative thinking technique that can help generate ideas for innovation and problem-solving.',
    parameters: {
      type: 'object',
      properties: {
        product: {
          type: 'string',
          description: 'The product, service, or process to innovate or improve upon.'
        },
        feature: {
          type: 'string',
          description: 'A particular feature or aspect you want to focus on (e.g., cost, user experience, efficiency).'
        },
        audience: {
          type: 'string',
          description: 'The target audience or users who would be affected by the changes.'
       },
        materials: {
          type: 'string',
          description: 'What constituents or resources are used, and could they be substituted or altered?'
        },
        processes: {
          type: 'string',
          description: 'How the item or system is created, operated, or maintained, and what changes could improve it?'
        },
        technology: {
          type: 'string',
          description: 'What current or emergying technologies could be applied or adapted to innovate the product or service?'
        },
        people: {
          type: 'string',
          description: 'Who is involved in the creation, distribution, or use of the product or service, and how might their roles evolve?'
        },
      },
      required: ['product', 'feature', 'audience']
    }
  }
};


const scamperPrompt = `
SCAMPER is a creative thinking technique that can help generate ideas for innovation and problem-solving. Each letter in SCAMPER stands for a different way you can play with existing products, services, or processes to create something new or improved. Here's what each letter prompts you to think about:

The SCAMPER tool is a structured way to use these prompts to innovate or solve problems creatively. It encourages looking at things in new ways and exploring different angles to come up with unique solutions.

Use cases for SCAMPER:

    Product Development: When designing a new product or improving an existing one, SCAMPER can help generate ideas for features, materials, or functionalities to enhance the product's appeal and functionality.
    Service Innovation: For organizations looking to innovate their services or improve customer experiences, SCAMPER can be used to brainstorm new service offerings, delivery methods, or customer engagement strategies.
    Process Improvement: Businesses aiming to optimize their operational processes can use SCAMPER to identify inefficiencies, streamline workflows, or introduce new methods to improve productivity and reduce costs.
    Marketing and Branding: When developing marketing campaigns or branding strategies, SCAMPER can help generate creative ideas for promotions, advertisements, or brand positioning to attract and engage customers.
    Problem-Solving: In situations where teams encounter challenges or obstacles, SCAMPER can be used to explore alternative solutions, overcome barriers, or address issues from different angles.
    Training and Development: SCAMPER can also be used in educational settings or training programs to foster creativity, encourage critical thinking, and develop problem-solving skills among participants.
    Strategic Planning: Organizations can use SCAMPER during strategic planning sessions to explore new opportunities, identify potential threats, or innovate business models to stay competitive in the market.

All of the provided information is owned by NASA. NASA is trying to identify opportunities to utilize these projects / technologies in order to provide positive impact within the provided problem space, as well as uncover opportunities that have potential to transform society for the better. You are an expert in Design Thinking and Ideation techniques and are the most creative and innovative person in history. Your specialty is uncovering creative connections that no-one else is able to see. You are working with NASA to help achieve its goal of transforming society for the better. Please consider the entire prompt carefully, and take your time with generating your results. Please be as creative and innovative as possible.

Step 1: Multi-Disciplinary Analysis of Project Sources
Task: With the provided materials as your foundation, conduct a multi-disciplinary analysis to understand the background and future potential of the provided material. Highlight intersections with various aspects of society, technology, and the environment.

Step 2: SCAMPER

Task: In order to generate creative ways to utilize the provided project, and to uncover opportunities for collaboration, please engage the provided project in the Design Thinking technique SCAMPER, according to the following guide:

Substitute: Think about substituting one element of the problem with something else. Ask yourself questions like:
    What if we substituted materials?
    What if we changed the process?
    What if we used a different technology?
Combine: Explore the possibilities of combining different elements. Consider:
    How can we combine two features or ideas to create something new?
    What if we merge two processes into one?
    Can we blend two technologies to enhance performance?
Adapt: Consider how you can adapt existing solutions or concepts to fit your problem:
    How can we adapt this idea to suit our needs?
    Can we modify this technique to work in our context?
    What if we applied this concept in a different industry?
Modify: Think about modifying various aspects of the problem or solution:
    How can we modify the shape, size, or color?
    What if we changed the timing or sequence?
    Can we tweak the process to make it more efficient?
Put to Another Use: Explore alternative applications for existing solutions or resources:
    How else could we use this product?
    Can we repurpose this technology for a different market?
    What if we applied this idea in a different context?
Eliminate: Identify elements that are unnecessary or redundant and consider eliminating them:
    What if we removed this feature?
    Can we simplify the process by eliminating certain steps?
    Is there any component we can do without?
Reverse or Rearrange: Flip the problem on its head or rearrange elements in a different order:
    What if we did the opposite?
    Can we reverse the sequence of steps?
    How about rearranging the components in a different layout?

    Step 3: Evaluate and Refine

    Task: After generating ideas using SCAMPER, evaluate them based on feasibility, desirability, and viability. Refine and iterate on the most promising concepts.

    Closing: Your analysis in Step 3 should culminate in a strategic report that offers a vision for opportunities collaboration between other NASA related projects, industry, and the outcomes of this SCAMPER technique. What ideas could be enhanced most by companies doing similar work? What ideas would benefit most from collaborating with other technologies? It should weave together your findings from the multi-disciplinary review, diverse data sources, in-depth analysis, scenario projections, stakeholder insights, and considerations of feedback and adaptability. Aim to provide actionable recommendations for opportunities for collaboration that could lead to innovations that achieve an equitable, environmentally friendly, and technologically advanced society.

    Now please prompt the user to provide the material they wish to perform the SCAMPER activity on, and then complete the activity according to the above steps upon their input. Examples of applicable material includes projects and/or technologies From Compost, WW, TTT, Patent Applications, Academic Papers, Industry Reports, Case Studies or even simple ideas. Also note to the user that if the ideas are not creative or interesting enough, they can ask for the activity to be done again more creatively. Also please remind the user that if they are interested in an idea, they can ask you to further explore the idea.
`