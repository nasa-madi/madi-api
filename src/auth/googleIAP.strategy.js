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
  
      const { emailField, idField, entity, errorMessage } = this.configuration;
      const entityService = this.entityService;
      let result = await entityService.find({
        ...params,
        query:{
          [emailField]: authentication.googleIAPEmail || null,
          [idField]: authentication.googleIAPUserId || null
        },
        
      });
      if(result?.data?.[0]){
        console.log('Is Authenticated',{
          authentication: { strategy: this.name },
          [entity]: result?.data?.[0]
        })
        return {
          authentication: { strategy: this.name },
          [entity]: result?.data?.[0]
        }
      }else{
        console.error('Not Authenticated',{
          authentication: { strategy: this.name },
          [entity]: result?.data?.[0]
        })
        throw new NotAuthenticated(errorMessage)
      }

  
    }
    async parse(req) {
      
      //example header accounts.google.com:example@gmail.com
      const emailScheme = req.headers && req.headers['x-goog-authenticated-user-email'];
      const userIdScheme = req.headers && req.headers['x-goog-authenticated-user-id'];
  
      // if(!emailScheme || !userIdScheme){
      //   throw new NotAuthenticated('Missing required IAP Headers')
      // }
      const [, email] = (emailScheme||'').match(/accounts\.google\.com:(.*)/) || [];
      const [, userId] = (userIdScheme||'').match(/accounts\.google\.com:(.*)/) || [];
  
      // if(!email || !userId){
      //   throw new NotAuthenticated('Missing required IAP Headers')
      // }
  
      return {
        strategy: this.name,
        googleIAPEmail: email,
        googleIAPUserId: userId  
      };
    }
  }
  