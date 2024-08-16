import {AuthenticationBaseStrategy, AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
// import { LocalStrategy } from '@feathersjs/authentication-local'
import { NotAuthenticated } from '@feathersjs/errors';
import { createDebug } from '@feathersjs/authentication/node_modules/@feathersjs/commons/lib/debug.js'

export class GoogleIAPStrategy extends AuthenticationBaseStrategy {
    debug = createDebug('authentication/googleIAP');
    async getEntityQuery(query, _params) {
      return {
          $limit: 1,
          ...query
      };
    }
    
  
    get configuration() {
      const authConfig = this.authentication.configuration
      const config = super.configuration || {}
  
      return {
        service: authConfig.service,
        entity: authConfig.entity,
        entityId: authConfig.entityId,
        errorMessage: 'Invalid IAP Credentials',
        emailField: config.emailField,
        userIdField: config.userIdField,
        ...config
      }
    }
    async authenticate(authentication, params) {
      // authentication = {
      //   strategy: "googleIAP",
      //   googleIAPEmail: "example@gmail.com",
      //   googleIAPUserId: "123456789",
      // }
      // console.log('AUTHENTICATE',authentication)
      // console.log('PARAMS',params)
      // console.log('USING IAP STRATEGY')
  
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
        return {
          authentication: { strategy: this.name },
          [entity]: result?.data?.[0]
        }
      }else{
        let { returnAuthBool } = params
        if(returnAuthBool){
          return false
        }
        // return false
        console.error('Not Authenticated',{
          authentication: { strategy: this.name },
          [entity]: result?.data?.[0]
        })
        throw new NotAuthenticated(errorMessage)
      }

  
    }
    async parse(req) {
      
      const headerToLowerCase = req.headers && Object.keys(req.headers).reduce((acc, current) => {
        acc[current.toLowerCase()] = req.headers[current];
        return acc;
      }, {});

      // console.log("HEADERS", req.headers)
      //example header accounts.google.com:example@gmail.com

      const emailScheme = headerToLowerCase['x-goog-authenticated-user-email'];
      const userIdScheme = headerToLowerCase['x-goog-authenticated-user-id'];

      if(!emailScheme || !userIdScheme){
        return null
        // throw new NotAuthenticated('Missing required IAP Headers')
      }

      const [, email] = (emailScheme||'').match(/accounts\.google\.com:(.*)/) || [];
      const [, userId] = (userIdScheme||'').match(/accounts\.google\.com:(.*)/) || [];
  
      if(!email || !userId){
        return null
        // throw new NotAuthenticated('Missing required IAP Headers')
      }
  
      return {
        strategy: this.name,
        googleIAPEmail: email,
        googleIAPUserId: userId  
      };
    }
  }
  