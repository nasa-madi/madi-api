import { DynamicTool } from "langchain/tools";
import { ScenarioInputChain } from './inputs/scenarioInput.chain.js'
import { ScenarioFramingChain } from "./framing/scenarioFraming.chain.js";
import { ScenarioLadderChain } from "./ladder/scenarioLadder.chain.js";
import { ScenarioBuildChain } from "./build/scenarioBuild.chain.js";
import { ScenarioImagePromptChain, ScenarioImages } from "./images/images.chain.js";
import { setupRecorder } from "../../utils/nockRecord.js";
import { getIdFromText } from "../../utils/text.js";
import { SourceStore } from "../../storage/source.store.js";
import { parseBoolean } from "../../utils/boolean.js";
import * as proxycache from '../../proxycache/proxycache.js'
import * as dotenv from 'dotenv'
dotenv.config()


// let sourceStore = await SourceStore();

// EXAMPLE INPUT: The trend is increasing water scarcity.  The need is water for drinking.  The capability is human jetpacks.

export const ScenarioTool = new DynamicTool({
    name: "scenario",
    description: "useful for creating a futurist scenario. The user must provide a trend, need, and capability. If they do not, clarify and ask the user. The Action_Input for the scenario tool MUST ABSOLUTELY be formatted as a list of trend, need, and capability like this TREND: the trend described and the timeline; NEED: the need or problem described; CAPABILITY: the specific capability or technology;",
    verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG),
    returnDirect:true,
    func: async (input) => {

      // if()
      // await sourceStore.similaritySearchVectorWithScore('input')


      //NOCK START
      // const { completeRecording } = await setupRecorder()(`ScenarioLadder_${getIdFromText(input)}`);  
              
        let inputChain = new ScenarioInputChain({
          outputKey:'inputs',
          verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)
        });
        let { inputs } = await inputChain.call({input})
        let { trend, need, capability } = inputs;

        let framingChain = new ScenarioFramingChain({
          outputKey:'framing',
          temperature:1,
          tokens: 1300,
          verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)
        });
        let { framing } = await framingChain.call({ trend, need, capability, additional_frames:"", additional_instructions:"" })

        let ladderChain = new ScenarioLadderChain({
          outputKey:'ladder',
          temperature:1,
          tokens: 2500,
          verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)
        });
        let { ladder } = await ladderChain.call({ framing, trend, need, capability, additional_frames:"", additional_instructions:"" })

      // completeRecording()
      //NOCK END


        // const { completeRecording:cr2 } = await setupRecorder()(`ScenarioNarrative_${getIdFromText(ladder)}`);  

        let buildChain = new ScenarioBuildChain({
          outputKey:'narrative',
          temperature:1,
          tokens: 2500,
          verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)
        });
        let { narrative } = await buildChain.call({ framing, trend, need, capability, ladder, additional_frames:"", additional_instructions:"" })

        // cr2();

        let imagePromptChain = new ScenarioImagePromptChain({
          outputKey:'imageprompts',
          temperature:1,
          tokens: 300,
          verbose: parseBoolean(process.env.VERBOSE) && parseBoolean(process.env.DEBUG)
        })

        const { imageprompts }= await imagePromptChain.call({ narrative });
 

        const imageLinks = await ScenarioImages(JSON.parse(imageprompts))

        return narrative + `\n\n### Images:\n\n${imageLinks.join('')}`

    }
})
