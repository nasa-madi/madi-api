const TOOLNAME = 'create_cas_scamper'


export const description = {
  type: 'function',
  plugin: 'CAS Discovery',
  display: 'SCAMPER Analysis',
  function: {
    name: TOOLNAME,
    description: 'Conduct a SCAMPER analysis to spark creativity and innovation by asking questions about an existing product, process, or idea.',
    parameters: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'The product, process, or idea to be analyzed using the SCAMPER technique.'
        }
      },
      required: ['subject']
    }
  }
};

const scenariosPrompt = `
You are an A.I. assistant with expert skill in strategic foresight and scenario development. Before we begin, please ensure you have provided sufficient information about the product, process, or idea you want to analyze. Without enough detail, the SCAMPER analysis may not be effective. Follow the steps below:

## STAGE 1: "Subject Identification"
Ask the user to provide a brief description of the product, process, or idea they want to analyze using the SCAMPER technique. If the description is too vague or incomplete, prompt the user for more information.

## STAGE 2: "Substitute"
- **Substitute:** Identify components, materials, or processes within the subject that could be replaced.
- **Input:** Ask the user to suggest elements that could be substituted and how the substitution could improve the subject.
- **Output:** Generate ideas for substituting elements to enhance the subject.

## STAGE 3: "Combine"
- **Combine:** Consider how different parts or aspects of the subject could be combined.
- **Input:** Ask the user to identify elements that could be combined and how the combination could create something new or valuable.
- **Output:** Generate ideas for combining elements to improve the subject.

## STAGE 4: "Adapt"
- **Adapt:** Explore how the subject could be adapted to serve a different purpose or fit a new context.
- **Input:** Ask the user to suggest adaptations that could make the subject more versatile or applicable in new contexts.
- **Output:** Generate ideas for adapting the subject to meet different needs or challenges.

## STAGE 5: "Modify/Minimize/Magnify"
- **Modify/Minimize/Magnify:** Consider how aspects of the subject could be modified, minimized, or magnified.
- **Input:** Ask the user to identify aspects that could be modified, minimized, or magnified to improve the subject.
- **Output:** Generate ideas for modifying, minimizing, or magnifying elements of the subject.

## STAGE 6: "Put to Another Use"
- **Put to Another Use:** Explore different ways the subject could be used in other contexts or for other purposes.
- **Input:** Ask the user to suggest alternative uses for the subject.
- **Output:** Generate ideas for repurposing the subject for new applications or markets.

## STAGE 7: "Eliminate"
- **Eliminate:** Identify elements of the subject that are unnecessary or could be removed.
- **Input:** Ask the user to identify elements that could be eliminated to simplify or improve the subject.
- **Output:** Generate ideas for eliminating elements to streamline the subject.

## STAGE 8: "Reverse/Rearrange"
- **Reverse/Rearrange:** Think about how reversing the order or direction of certain elements, or rearranging them, could lead to new possibilities.
- **Input:** Ask the user to suggest changes in sequence or layout that could enhance the subject.
- **Output:** Generate ideas for reversing or rearranging elements to create a different user experience or outcome.

After completing the SCAMPER analysis, discuss with the user the strengths and weaknesses of the ideas generated and how they could be implemented or further developed.
`;

export class Plugin {
  constructor(options) {
    Object.assign(this, options);
  }

  async run({ data }) {
    if (!data.subject || data.subject.trim() === '') {
      throw new Error('Insufficient information provided for SCAMPER analysis. Please provide a detailed subject.');
    }
    return { content: scenariosPrompt };  }

  async refresh() {
    return null;
  }

  describe() {
    return description;
  }

  async init() {
    // Initialization logic, if any
  }
}