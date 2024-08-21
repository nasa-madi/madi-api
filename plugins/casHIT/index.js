import { BasePlugin } from 'madi-plg-base-class'
/**
 * Class representing the SemanticScholar plugin.
 */
const TOOLNAME = 'create_cas_hitmatrix'

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
    return {content: hitPrompt}
  }
}


// The static description object for the HIT Matrix generation tool.
export const description = {
  type: 'function',
  plugin: 'CAS Discovery',
  // Identifier for the plugin
  display: 'HIT Matrix',
  // Display name for the UI
  function: {
    name: TOOLNAME,
    description: 'Generate a HIT Matrix. The tool goes through hierarchical, interaction, and trade-off analysis steps to provide a structured output for strategic decision-making and innovation.',
    parameters: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          description: 'The specific context or domain to apply the HIT Matrix analysis (e.g., leadership, innovation, team dynamics).'
        },
        components: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Key components to be included in the HIT Matrix analysis (e.g., trust, delegation, emotional capacity).'
        },
        goal: {
          type: 'string',
          description: 'The desired outcome or objective the HIT Matrix should aim to achieve (e.g., enhanced leadership effectiveness, team innovation).'
        },
        timeframe: {
          type: 'string',
          description: 'The timeframe over which the HIT Matrix analysis should consider the interactions and trade-offs (e.g., short-term, long-term).'
        },
        tradeOffs: {
          type: 'boolean',
          description: 'Whether to include an analysis of potential trade-offs in the HIT Matrix. Defaults to true.'
        }
      },
      required: ['context', 'components', 'goal']
    }
  }
};


const hitPrompt = `
**Objective:** To analyze and innovate within a specific context by applying the HIT (Hierarchy, Interaction, and Trade-off) Matrix technique, drawing on prior inputs and reflections from the Executive MBA program, specifically from the Leadership and Innovation Module (LIM).

**Contextual Inputs:**
1. **Leadership Reflections:**
   - Immediate respect and trust for peers led to willingness to let others lead.
   - Importance of psychological safety and building leader-to-leader (L2) relationships.
   - Awareness of three levels of emotional fatigue and its impact on leadership and cooperation style.

2. **Innovation and Change:**
   - Application of exercises like 'diversity dimensions' to enhance team dynamics.
   - Focus on self-regulation and emotional capacity to engage with peers.
   - Reflection on teamwork with diverse careers and levels of success.

**HIT Matrix Technique:**
1. **Hierarchy:**
   - Identify the key components of the leadership context (e.g., trust, delegation, emotional capacity, psychological safety).
   - Arrange these components in a hierarchical order based on their importance and impact on the desired outcomes (e.g., effective leadership, team innovation, emotional well-being).

2. **Interaction:**
   - Analyze the interactions between the components identified in the hierarchy.
   - Determine how each component influences the others and how these interactions contribute to the overall goals (e.g., trust enhancing delegation, emotional capacity impacting psychological safety).

3. **Trade-off:**
   - Identify potential trade-offs between the components.
   - Evaluate the strengths and weaknesses of each trade-off in achieving the desired outcomes.
   - Propose solutions or innovations that balance these trade-offs effectively.

**Output:**
- A detailed HIT Matrix highlighting the hierarchy, interactions, and trade-offs within the leadership context.
- An analysis of the strengths and weaknesses of the current state and proposed innovations.
- Recommendations for implementing the HIT Matrix findings to enhance leadership effectiveness and team innovation.

**Format:**
1. **Hierarchy:**
   - List of components in hierarchical order.
   - Explanation of the importance and impact of each component.

2. **Interaction:**
   - Description of key interactions between components.
   - Analysis of how these interactions contribute to or hinder the desired outcomes.

3. **Trade-off:**
   - Identification of trade-offs and their implications.
   - Evaluation of strengths and weaknesses of each trade-off.
   - Recommendations for balancing trade-offs and enhancing overall effectiveness.
`