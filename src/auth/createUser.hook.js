import { defineAbilitiesFor } from "./abilites.js";
import { authorize } from "feathers-casl";

export const createUserHook = //(options)=>
    async (context,next)=>{
        
        // if the user is a superadmin


        const { emailField, idField, entity, errorMessage } = this.configuration;
        const entityService = this.entityService;
        let result = await entityService.find({
          ...params,
          provider:null,
          query:{
            [emailField]: authentication.googleIAPEmail || null,
            // Comented out so that only the googleIAPEmail is required for auth, since the 
            // first interaction will not have a user credential established.
            // [idField]: authentication.googleIAPUserId || null
          },
        });
        if(result?.data?.[0]){
          // console.log('Is Authenticated',{
          //   authentication: { strategy: this.name },
          //   [entity]: result?.data?.[0]
          // })
          return {
            authentication: { strategy: this.name },
            [entity]: result?.data?.[0]
          }
        }else{
          // return false
          console.error('Not Authenticated',{
            authentication: { strategy: this.name },
            [entity]: result?.data?.[0]
          })
          throw new NotAuthenticated(errorMessage)
        }
        const { user } = context.params;

        if (!user){

            // context.params.ability = defineAbilitiesFor(user);
            // await authorize({ adapter: '@feathersjs/knex' })(context)
            // return context;
        }
        

    }
