import { defineAbilitiesFor } from "./abilites.js";
import { authorize } from "feathers-casl";

export const authorizeHook = //(options)=>
    async (context,next)=>{
        const { user } = context.params;
        if (user) context.params.ability = defineAbilitiesFor(user);
        
        await authorize({ adapter: '@feathersjs/knex' })(context)

        return context;
    }
