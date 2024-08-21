import { AuthenticationBaseStrategy } from '@feathersjs/authentication';
import { NotAuthenticated } from '@feathersjs/errors';
import { createDebug } from '@feathersjs/authentication/node_modules/@feathersjs/commons/lib/debug.js';
import { logger } from '../logger.js';


export class GoogleCLIStrategy extends AuthenticationBaseStrategy {
  debug = createDebug('authentication/googleIAP');

  async getEntityQuery(query, _params) {
    return {
      $limit: 1,
      ...query
    };
  }

  get configuration() {
    const authConfig = this.authentication.configuration;
    const config = super.configuration || {};

    return {
      service: authConfig.service,
      entity: authConfig.entity,
      entityId: authConfig.entityId,
      errorMessage: 'Invalid CLI Credentials',
      emailField: config.emailField,
      userIdField: config.userIdField,
      ...config
    };
  }

  async authenticate(authentication, params) {
    const { emailField, idField, entity, errorMessage } = this.configuration;
    const entityService = this.entityService;
    let result = await entityService.find({
      ...params,
      provider: null,
      query: {
        [emailField]: authentication.googleCLIEmail || null,
      },
    });

    if (result?.data?.[0]) {
      return {
        authentication: { strategy: this.name },
        [entity]: result?.data?.[0]
      };
    } else {
      let { returnAuthBool } = params;
      if (returnAuthBool) {
        return false;
      }
      console.error('Not Authenticated', {
        authentication: { strategy: this.name },
        [entity]: result?.data?.[0]
      });
      throw new NotAuthenticated(errorMessage);
    }

  }
  async parse(req) {
    const headerToLowerCase = req.headers && Object.keys(req.headers).reduce((acc, current) => {
      acc[current.toLowerCase()] = req.headers[current];
      return acc;
    }, {});
  
    const authorizationHeader = headerToLowerCase['authorization'];
    if (!authorizationHeader) {
      return null;
      // throw new NotAuthenticated('Missing Authorization header');
    }
        
    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return null
      // throw new NotAuthenticated('Invalid Authorization header format');
    }
  
    const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`;
  
    let tokenInfo;
    try {
      const response = await fetch(tokenInfoUrl);
      if (!response.ok) {
        throw new NotAuthenticated('Token verification failed');
      }
      tokenInfo = await response.json();
    } catch (error) {
      throw new NotAuthenticated('Error verifying token',error);
    }

    logger.info('AUTH: GOOGLE CLI: Email from token ' + tokenInfo.email)
    const email = tokenInfo.email;
    const userId = tokenInfo.sub;
  
    if (!email || !userId) {
      throw new NotAuthenticated('Missing required token fields');
    }
  
    return {
      strategy: this.name,
      googleCLIEmail: email,
      googleCLIUserId: userId
    };
  }
}